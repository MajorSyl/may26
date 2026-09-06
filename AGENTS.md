# Project Rules & Design Guidelines

## Image Handling Rule (Active)
- **NO CSS filters, color tints, dark overlays, opacity modifications, or gradients** may be applied over or behind images.
- Images must never be stretched or have their aspect ratio distorted.
- Full-detail views (Project Details, gallery lightboxes, etc.) show the complete, uncropped photo: `object-fit: contain` or a natural bounding box, so the subject is never cut off there.
- Fixed-aspect-ratio thumbnails (project/gallery cards) may use a tasteful, centered `object-fit: cover` crop when a photo's native aspect ratio doesn't match the card -- per explicit, repeated user direction. Crop conservatively: keep faces and the main subject fully in frame: prefer trimming background/empty space over people.
