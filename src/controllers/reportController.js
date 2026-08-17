import { db } from "../db/index.js";
import { reports } from "../db/schema.js";
import { z } from "zod";

const reportSchema = z.object({
  reporterId: z.string(),
  roomType: z.string().optional(),
  reason: z.string().min(1).max(1000),
});

export const submitReport = async (req, res) => {
  try {
    const validatedData = reportSchema.parse(req.body);
    
    await db.insert(reports).values(validatedData);
    
    res.status(201).json({ success: true, message: "Report submitted successfully." });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("Error submitting report:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
};
