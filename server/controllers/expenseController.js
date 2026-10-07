const { all, get, run } = require('../database/db');

const getExpenses = async (req, res) => {
  try {
    const expenses = await all('SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC, created_at DESC', [req.user.id]);
    return res.json({ success: true, data: expenses });
  } catch (error) {
    console.error('Get expenses error:', error);
    return res.status(500).json({ success: false, message: 'Could not load expenses.' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    return res.json({ success: true, data: expense });
  } catch (error) {
    console.error('Get expense by id error:', error);
    return res.status(500).json({ success: false, message: 'Could not load expense.' });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, date, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is required.' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Expense category is required.' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Expense date is required.' });
    }

    const validCategories = ['Food', 'Transport', 'Hostel', 'Study', 'Entertainment', 'Shopping', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid expense category.' });
    }

    const result = await run(
      'INSERT INTO expenses (user_id, title, amount, category, date, description) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title.trim(), Number(amount), category, date, description || '']
    );

    const expense = await get('SELECT * FROM expenses WHERE id = ?', [result.id]);
    return res.status(201).json({
      success: true,
      message: 'Expense added successfully.',
      data: expense,
    });
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ success: false, message: 'Could not add expense.' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category, date, description } = req.body;

    const existingExpense = await get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existingExpense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Expense title is required.' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Expense amount must be greater than zero.' });
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Expense category is required.' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Expense date is required.' });
    }

    const validCategories = ['Food', 'Transport', 'Hostel', 'Study', 'Entertainment', 'Shopping', 'Other'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ success: false, message: 'Invalid expense category.' });
    }

    await run(
      'UPDATE expenses SET title = ?, amount = ?, category = ?, date = ?, description = ? WHERE id = ? AND user_id = ?',
      [title.trim(), Number(amount), category, date, description || '', id, req.user.id]
    );

    const updatedExpense = await get('SELECT * FROM expenses WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Expense updated successfully.',
      data: updatedExpense,
    });
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ success: false, message: 'Could not update expense.' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await get('SELECT * FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    await run('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Expense deleted successfully.' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete expense.' });
  }
};

module.exports = {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
};
