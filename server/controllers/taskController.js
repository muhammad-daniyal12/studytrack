const { all, get, run } = require('../database/db');

const getTasks = async (req, res) => {
  try {
    const tasks = await all(
      `SELECT t.*, s.name AS subject_name
       FROM tasks t
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE t.user_id = ?
       ORDER BY t.due_date IS NULL, t.due_date ASC, t.created_at DESC`,
      [req.user.id]
    );

    return res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Get tasks error:', error);
    return res.status(500).json({ success: false, message: 'Could not load tasks.' });
  }
};

const getTaskById = async (req, res) => {
  try {
    const task = await get(
      `SELECT t.*, s.name AS subject_name
       FROM tasks t
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE t.id = ? AND t.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    return res.json({ success: true, data: task });
  } catch (error) {
    console.error('Get task by id error:', error);
    return res.status(500).json({ success: false, message: 'Could not load task.' });
  }
};

const createTask = async (req, res) => {
  try {
    const { title, description, subject_id, due_date, priority, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    if (subject_id) {
      const subject = await get('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, req.user.id]);
      if (!subject) {
        return res.status(400).json({ success: false, message: 'Invalid subject selected.' });
      }
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Pending', 'Completed'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be Low, Medium, or High.' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Pending or Completed.' });
    }

    const finalPriority = priority || 'Medium';
    const finalStatus = status || 'Pending';

    const result = await run(
      `INSERT INTO tasks (user_id, subject_id, title, description, due_date, priority, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, subject_id || null, title.trim(), description || '', due_date || null, finalPriority, finalStatus]
    );

    const task = await get('SELECT * FROM tasks WHERE id = ?', [result.id]);
    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      data: task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ success: false, message: 'Could not create task.' });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, subject_id, due_date, priority, status } = req.body;

    const existingTask = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    if (subject_id) {
      const subject = await get('SELECT id FROM subjects WHERE id = ? AND user_id = ?', [subject_id, req.user.id]);
      if (!subject) {
        return res.status(400).json({ success: false, message: 'Invalid subject selected.' });
      }
    }

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required.' });
    }

    const validPriorities = ['Low', 'Medium', 'High'];
    const validStatuses = ['Pending', 'Completed'];

    if (priority && !validPriorities.includes(priority)) {
      return res.status(400).json({ success: false, message: 'Priority must be Low, Medium, or High.' });
    }

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Pending or Completed.' });
    }

    await run(
      `UPDATE tasks
       SET title = ?, description = ?, subject_id = ?, due_date = ?, priority = ?, status = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ? AND user_id = ?`,
      [title.trim(), description || '', subject_id || null, due_date || null, priority || existingTask.priority, status || existingTask.status, id, req.user.id]
    );

    const updatedTask = await get('SELECT * FROM tasks WHERE id = ?', [id]);
    return res.json({
      success: true,
      message: 'Task updated successfully.',
      data: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ success: false, message: 'Could not update task.' });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await get('SELECT * FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found.' });
    }

    await run('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, req.user.id]);
    return res.json({ success: true, message: 'Task deleted successfully.' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ success: false, message: 'Could not delete task.' });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
