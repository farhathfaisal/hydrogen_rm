/**
 * Klaviyo Newsletter Signup API Route
 *
 * Uses profile-subscription-bulk-create-jobs with historical_import: false
 * to trigger double opt-in.
 *
 * Set up in .env:
 *   - KLAVIYO_PRIVATE_API_KEY=your_private_api_key
 *   - KLAVIYO_LIST_ID=your_list_id
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

    const KLAVIYO_API_KEY = context.env?.KLAVIYO_PRIVATE_API_KEY;
    const KLAVIYO_LIST_ID = context.env?.KLAVIYO_LIST_ID;

    if (!KLAVIYO_API_KEY || !KLAVIYO_LIST_ID) {
      console.error('Klaviyo credentials not configured');
      return new Response(JSON.stringify({success: true, dev: true}), {
        status: 200,
        headers: {'Content-Type': 'application/json'},
      });
    }

    // Use profile-subscription-bulk-create-jobs with historical_import: false
    // This triggers double opt-in when the list has it enabled
    const response = await fetch(
      'https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs',
      {
        method: 'POST',
        headers: {
          accept: 'application/vnd.api+json',
          revision: '2025-01-15',
          'content-type': 'application/vnd.api+json',
          Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
        },
        body: JSON.stringify({
          data: {
            type: 'profile-subscription-bulk-create-job',
            attributes: {
              historical_import: false,
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
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Klaviyo API error:', response.status, errorText);
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
