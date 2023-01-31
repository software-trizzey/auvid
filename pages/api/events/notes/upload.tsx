import { NextApiRequest, NextApiResponse } from "next";
import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";

import { v4 } from "uuid";

import prisma from "../../../../utils/prisma-client";
import { NoteAction } from "../../../../utils/enums";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	try {
		// Create authenticated Supabase Client
		const supabase = createServerSupabaseClient({ req, res });
		// Check for session
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (!session)
			return res.status(401).json({
				error: "not_authenticated",
				message:
					"The user does not have an active session or is not authenticated",
			});

		const userId = session.user.id;
		const { filename, has_summary } = req.body;

		const requestConfig = {
			request_id: v4(), // unique id for request
			headers: req.headers,
			url: req.url,
			method: req.method,
			data: req.body,
		};

		// create note upload event using prisma nested create
		const event = await prisma.events.create({
			data: {
				description: `Upload event for: ${filename}`, // has no extension
				metadata: requestConfig,
				profile: {
					connect: { id: userId },
				},
				notes: {
					create: {
						has_summary: has_summary,
						type: NoteAction.uploaded,
					},
				},
			},
			select: {
				id: true,
				created_at: true,
				description: true,
				profile: {
					select: {
						id: true, // just profile id
					},
				},
				notes: true,
			},
		});

		res.status(200).json({ event, message: "Note uploaded event created" });
	} catch (error) {
		console.log(error);
		res.status(500).json({ error: error.message });
	}
};

export default handler;
