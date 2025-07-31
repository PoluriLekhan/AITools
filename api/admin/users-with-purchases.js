import { client } from '@/sanity/lib/client';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all users with their purchase history
    const users = await client.fetch(`
      *[_type == "author"] {
        _id,
        name,
        email,
        plan,
        isAdmin,
        role,
        "purchaseHistory": *[_type == "payment" && references(^._id)] {
          _id,
          plan,
          amount,
          status,
          createdAt
        }
      }
    `);

    // Transform the data to match the expected format
    const transformedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      currentPlan: user.plan || 'Free',
      isAdmin: user.isAdmin,
      role: user.role,
      purchaseHistory: user.purchaseHistory.map(payment => ({
        id: payment._id,
        plan: payment.plan,
        amount: payment.amount,
        date: payment.createdAt,
        status: payment.status
      }))
    }));

    res.status(200).json({ users: transformedUsers });
  } catch (error) {
    console.error('Error fetching users with purchases:', error);
    res.status(500).json({ error: 'Failed to fetch users with purchases' });
  }
} 