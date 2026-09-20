const Item = require('../models/Item');

// @desc    Create a listing
// @route   POST /api/items
// @access  Private
exports.createItem = async (req, res) => {
  try {
    const { name, description, category, condition, deposit, imageUrl, pickupLocation } = req.body;
    const item = await Item.create({
      owner: req.user.id,
      name,
      description,
      category,
      condition,
      deposit: deposit || 0,
      imageUrl,
      pickupLocation
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all items (search/filter)
// @route   GET /api/items
// @access  Public/Private
exports.getItems = async (req, res) => {
  try {
    const { keyword, category, availability } = req.query;
    
    let query = {};
    if (keyword) {
      query.name = { $regex: keyword, $options: 'i' };
    }
    if (category) {
      query.category = category;
    }
    if (availability !== undefined) {
      query.isAvailable = availability === 'true';
    }

    const items = await Item.find(query).populate('owner', 'name college');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single item
// @route   GET /api/items/:id
// @access  Public/Private
exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('owner', 'name college department year');
    if (item) {
      res.json(item);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
exports.updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      // Check ownership
      if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to update this item' });
      }

      item.name = req.body.name || item.name;
      item.description = req.body.description || item.description;
      item.category = req.body.category || item.category;
      item.condition = req.body.condition || item.condition;
      item.deposit = req.body.deposit !== undefined ? req.body.deposit : item.deposit;
      item.imageUrl = req.body.imageUrl || item.imageUrl;
      item.pickupLocation = req.body.pickupLocation || item.pickupLocation;
      if (req.body.isAvailable !== undefined) {
        item.isAvailable = req.body.isAvailable;
      }

      const updatedItem = await item.save();
      res.json(updatedItem);
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (item) {
      // Check ownership
      if (item.owner.toString() !== req.user.id && req.user.role !== 'admin') {
        return res.status(401).json({ message: 'Not authorized to delete this item' });
      }

      await item.deleteOne();
      res.json({ message: 'Item removed' });
    } else {
      res.status(404).json({ message: 'Item not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
