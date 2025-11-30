/**
 * Klaviyo Newsletter Signup API Route
 *
 * To set up:
 * 1. Get your Klaviyo Private API Key from Settings > API Keys
 * 2. Create a list in Klaviyo and get the List ID
 * 3. Add these to your .env file:
 *    - KLAVIYO_PRIVATE_API_KEY=your_private_key
 *    - KLAVIYO_LIST_ID=your_list_id
 */

/**
 * @param {Route.ActionArgs} args
 */
export async function action({request, context}) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {status: 405});
  }

  try {
    const body = await request.json();
    const {email} = body;

    if (!email) {
      return new Response(JSON.stringify({error: 'Email is required'}), {
        status: 400,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // Get Klaviyo credentials from environment
    const KLAVIYO_PRIVATE_API_KEY = context.env?.KLAVIYO_PRIVATE_API_KEY;
    const KLAVIYO_LIST_ID = context.env?.KLAVIYO_LIST_ID;

    if (!KLAVIYO_PRIVATE_API_KEY || !KLAVIYO_LIST_ID) {
      console.error('Klaviyo credentials not configured');
      // For development, return success anyway to test the form
      return new Response(JSON.stringify({success: true, dev: true}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // Subscribe to Klaviyo list using the new API (2023-02-22 revision)
    const response = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/',
      {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${KLAVIYO_PRIVATE_API_KEY}`,
          'Content-Type': 'application/json',
          'revision': '2023-02-22',
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              profiles: {
                data: [
                  {
                    type: 'profile',
                    attributes: {
                      email: email,
                      subscriptions: {
                        email: {
                          marketing: {
                            consent: 'SUBSCRIBED',
                          },
                        },
                      },
                    },
                  },
                ],
              },
            },
            relationships: {
              list: {
                data: {
                  type: 'list',
                  id: KLAVIYO_LIST_ID,
                },
              },
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Klaviyo API error:', errorData);
      throw new Error('Failed to subscribe');
    }

    return new Response(JSON.stringify({success: true}), {
      status: 200,
      headers: {'Content-Type': 'application/json'},
    });
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return new Response(JSON.stringify({error: 'Failed to subscribe'}), {
      status: 500,
      headers: {'Content-Type': 'application/json'},
    });
  }
}

/** @typedef {import('./+types/api.newsletter').Route} Route */
