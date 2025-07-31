import { client } from '@/sanity/lib/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { toolId, action, documentType, updates, status, adminEmail } = req.body;

  if (!toolId || !action || !documentType || !adminEmail) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Verify admin status
    const admin = await client.fetch(`*[_type == "author" && email == $email && isAdmin == true][0]`, { email: adminEmail });
    if (!admin) {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    let result;

    switch (action) {
      case 'update':
        result = await client
          .patch(toolId)
          .set(updates)
          .commit();
        break;

      case 'updateStatus':
        result = await client
          .patch(toolId)
          .set({ status })
          .commit();
        break;

      case 'delete':
        result = await client.delete(toolId);
        break;

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error managing tool:', error);
    res.status(500).json({ error: 'Failed to manage tool' });
  }
} 