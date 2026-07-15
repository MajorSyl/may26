# Project Rules & Design Guidelines

## Image Handling Rule (Active)
- Every time an image is uploaded or designated for use in the interface, it **MUST** be implemented as a raw, 100% unaltered asset.
- **NO CSS filters, color tints, dark overlays, opacity modifications, or gradients** may be applied over or behind the images.
- Images must **never** be cropped, stretched, or have their aspect ratio distorted.
- Always use `object-fit: contain` or natural bounding boxes with correct aspect-ratio preservation so that the subjects and faces within the photographs are completely intact and uncompromised.
