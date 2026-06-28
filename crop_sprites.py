import sys
try:
    from PIL import Image, ImageChops
    for phase in ['calm', 'turbulent', 'elevated']:
        path = f'public/sprites/boss-{phase}-idle.png'
        img = Image.open(path)
        # convert to RGB
        img = img.convert("RGB")
        # get background color from top left
        bg_color = img.getpixel((0, 0))
        # threshold to find non-background pixels
        # since it's jpeg, allow some tolerance
        diff = ImageChops.difference(img, Image.new("RGB", img.size, bg_color))
        # convert to grayscale
        diff = diff.convert("L")
        # threshold
        diff = diff.point(lambda p: p > 20 and 255)
        bbox = diff.getbbox()
        if bbox:
            print(f"{phase} bbox: {bbox}")
            cropped = img.crop(bbox)
            cropped.save(path)
            print(f"Cropped {phase} to {cropped.size}")
        else:
            print(f"{phase} bounding box not found")
except ImportError:
    print("PIL not installed")
