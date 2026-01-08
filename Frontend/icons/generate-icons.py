#!/usr/bin/env python3
"""
Generate PWA icons for NewBus application
Requires: pip install Pillow
"""

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    print("Pillow is required. Install it with: pip install Pillow")
    exit(1)

import os

# Icon sizes required for PWA
SIZES = [72, 96, 128, 144, 152, 192, 384, 512]

def create_bus_icon(size):
    """Create a bus icon with the specified size"""
    # Create image with transparent background
    img = Image.new('RGB', (size, size), color='#4A90E2')
    draw = ImageDraw.Draw(img)
    
    # Draw rounded rectangle background
    margin = int(size * 0.05)
    draw.rounded_rectangle(
        [margin, margin, size - margin, size - margin],
        radius=int(size * 0.15),
        fill='#4A90E2'
    )
    
    # Draw bus body (white rectangle)
    bus_width = int(size * 0.6)
    bus_height = int(size * 0.4)
    bus_x = (size - bus_width) // 2
    bus_y = (size - bus_height) // 2
    
    # Bus body
    draw.rounded_rectangle(
        [bus_x, bus_y, bus_x + bus_width, bus_y + bus_height],
        radius=int(size * 0.05),
        fill='#FFFFFF'
    )
    
    # Bus windows
    window_width = int(bus_width * 0.15)
    window_height = int(bus_height * 0.4)
    window_spacing = int(bus_width * 0.2)
    window_y = bus_y + int(bus_height * 0.2)
    
    # Left window
    draw.rectangle(
        [bus_x + window_spacing, window_y,
         bus_x + window_spacing + window_width, window_y + window_height],
        fill='#4A90E2'
    )
    
    # Right window
    draw.rectangle(
        [bus_x + bus_width - window_spacing - window_width, window_y,
         bus_x + bus_width - window_spacing, window_y + window_height],
        fill='#4A90E2'
    )
    
    # Bus wheels
    wheel_radius = int(size * 0.06)
    wheel_y = bus_y + bus_height
    
    # Left wheel
    draw.ellipse(
        [bus_x + int(bus_width * 0.25) - wheel_radius, wheel_y - wheel_radius,
         bus_x + int(bus_width * 0.25) + wheel_radius, wheel_y + wheel_radius],
        fill='#2E5C8A'
    )
    
    # Right wheel
    draw.ellipse(
        [bus_x + int(bus_width * 0.75) - wheel_radius, wheel_y - wheel_radius,
         bus_x + int(bus_width * 0.75) + wheel_radius, wheel_y + wheel_radius],
        fill='#2E5C8A'
    )
    
    return img

def generate_all_icons(output_dir='.'):
    """Generate all required icon sizes"""
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    
    print("Generating PWA icons for NewBus...")
    
    for size in SIZES:
        icon = create_bus_icon(size)
        filename = f'icon-{size}x{size}.png'
        filepath = os.path.join(output_dir, filename)
        icon.save(filepath, 'PNG')
        print(f"✓ Generated {filename}")
    
    print(f"\n✓ All icons generated successfully in '{output_dir}' directory!")
    print("Icons are ready for PWA deployment.")

if __name__ == '__main__':
    # Generate icons in current directory
    generate_all_icons()

