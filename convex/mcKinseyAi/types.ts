export interface SlackEvent {
  token: string;
  team_id: string;
  api_app_id: string;
  event: {
    user: string;
    type: string;
    ts: string;
    client_msg_id: string;
    text: string;
    team: string;
    blocks: Array<{
      type: string;
      block_id: string;
      elements: Array<Record<string, unknown>>;
    }>;
    channel: string;
    event_ts: string;
    thread_ts?: string;
    parent_user_id?: string;
  };
  type: string;
  event_id: string;
  event_time: number;
  authorizations: Array<{
    enterprise_id: string | null;
    team_id: string;
    user_id: string;
    is_bot: boolean;
    is_enterprise_install: boolean;
  }>;
  is_ext_shared_channel: boolean;
  event_context: string;
}

export interface SlackChallenge {
  challenge: string;
}

// 10/9/2025, 5:32:14 PM [CONVEX H(POST /slack)] [LOG] 'body' {
//   token: '8uCGkG0Qumszf1ckC6gcdPd3',
//   team_id: 'T05F0GQQER0',
//   api_app_id: 'A07N93W4MPC',
//   event: {
//     user: 'U05H2SM3TF0',
//     type: 'app_mention',
//     ts: '1760005928.816399',
//     client_msg_id: 'b4a8137a-ed9d-4dbf-bfe9-06c2599454fa',
//     text: '<@U07N9464S4A> this message is in regular',
//     team: 'T05F0GQQER0',
//     blocks: [
//       {
//         type: 'rich_text',
//         block_id: 'WhKmu',
//         elements: [ [Object] ]
//       }
//     ],
//     channel: 'C09KH9L4CJH',
//     event_ts: '1760005928.816399'
//   },
//   type: 'event_callback',
//   event_id: 'Ev09KLPQTR7U',
//   event_time: 1760005928,
//   authorizations: [
//     {
//       enterprise_id: null,
//       team_id: 'T05F0GQQER0',
//       user_id: 'U07N9464S4A',
//       is_bot: true,
//       is_enterprise_install: false
//     }
//   ],
//   is_ext_shared_channel: false,
//   event_context: '4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDA1RjBHUVFFUjAiLCJhaWQiOiJBMDdOOTNXNE1QQyIsImNpZCI6IkMwOUtIOUw0Q0pIIn0'
// }
// 10/9/2025, 5:32:22 PM [CONVEX H(POST /slack)] [LOG] 'body' {
//   token: '8uCGkG0Qumszf1ckC6gcdPd3',
//   team_id: 'T05F0GQQER0',
//   api_app_id: 'A07N93W4MPC',
//   event: {
//     user: 'U05H2SM3TF0',
//     type: 'app_mention',
//     ts: '1760005940.933399',
//     client_msg_id: '7f651248-b457-4f23-bc17-cc3ebae1cc61',
//     text: '<@U07N9464S4A> this message is in thread',
//     team: 'T05F0GQQER0',
//     thread_ts: '1760005928.816399',
//     parent_user_id: 'U05H2SM3TF0',
//     blocks: [
//       {
//         type: 'rich_text',
//         block_id: 'J9L33',
//         elements: [ [Object] ]
//       }
//     ],
//     channel: 'C09KH9L4CJH',
//     event_ts: '1760005940.933399'
//   },
//   type: 'event_callback',
//   event_id: 'Ev09KEBHF9UK',
//   event_time: 1760005940,
//   authorizations: [
//     {
//       enterprise_id: null,
//       team_id: 'T05F0GQQER0',
//       user_id: 'U07N9464S4A',
//       is_bot: true,
//       is_enterprise_install: false
//     }
//   ],
//   is_ext_shared_channel: false,
//   event_context: '4-eyJldCI6ImFwcF9tZW50aW9uIiwidGlkIjoiVDA1RjBHUVFFUjAiLCJhaWQiOiJBMDdOOTNXNE1QQyIsImNpZCI6IkMwOUtIOUw0Q0pIIn0'
// }
