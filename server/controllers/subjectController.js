const { get, all, run } = require('../database/db');

const getSubjects = async (req, res) => {
  try {
    const subjects = await all('SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    return res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    return res.status(500).json({ success: false, message: 'Could not load subjects.' });
  }
};

const createSubject = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const result = await run('INSERT INTO subjects (user_id, name) VALUES (?, ?)', [req.user.id, name.trim()]);
    const subject = await get('SELECT * FROM subjects WHERE id = ?', [result.id]);

    return res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: subject,
    });
  } catch (error) {
    console.error('Create subject error:', error);
    return res.status(500).json({ success: false, message: 'Could not create subject.' });
  }
};

const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subject name is required.' });
    }

    const subject = await get('SELECT * FROM subjects WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await run('UPDATE subjects SET name = ? WHERE id = ? AND user_id = ?', [name.trim(), id, req.user.id]);
    const updatedSubject = await get('SELECT * FROM subjects WHERE id = ?', [id]);

    return res.json({
      success: true,
      message: 'Subject updated successfully.',
      data: updatedSubject,
    });
  } catch (error) {
    console.error('Update subject error:', error);
    return res.status(500).json({ success: false, message: 'Could not update subject.' });
  }
};

const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await get('SELECT * FROM subjects WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await run('DELETE FROM subjects WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Delete subject error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete subject.' });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
