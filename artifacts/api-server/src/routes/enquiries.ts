import { Router, type IRouter } from "express";
import { db, enquiriesTable } from "@workspace/db";
import { CreateEnquiryBody, CreateEnquiryResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/enquiries", async (req, res): Promise<void> => {
  const parsed = CreateEnquiryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid enquiry body");
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [enquiry] = await db.insert(enquiriesTable).values({
    ...parsed.data,
    enquiryType: parsed.data.enquiryType ?? "general",
  }).returning({ id: enquiriesTable.id });

  res.status(201).json(CreateEnquiryResponse.parse({
    id: enquiry.id,
    message: "Thank you. The IKKA Estate team will be in touch shortly.",
  }));
});

export default router;