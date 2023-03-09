import type { NextApiRequest, NextApiResponse } from 'next'
import type { Database } from '../../../../supabase/types/public'
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs'

import { v4 } from 'uuid'
import { NoteAction } from '../../../../utils/enums'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const supabase = createServerSupabaseClient<Database>({ req, res })
    const {
      data: { user }
    } = await supabase.auth.getUser()

    if (!user)
      return res.status(401).json({
        error: 'not_authenticated',
        message:
          'The user does not have an active session or is not authenticated'
      })
    const { filename, has_summary } = req.body

    const requestConfig = {
      request_id: v4(),
      headers: req.headers,
      url: req.url,
      method: req.method,
      data: req.body
    }

    const { data, error } = await supabase.rpc('handle_new_note_event', {
      event_description: `Download event for:  ${filename}`,
      event_meta: requestConfig,
      event_type: NoteAction.downloaded,
      note_has_summary: has_summary
    })

    if (error) throw error

    res
      .status(200)
      .json({ event: data, message: 'Note download event created' })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error: error.message })
  }
}

export default handler
