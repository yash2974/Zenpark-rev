import qrcode

# Data to encode
data = "sKoMMzRzfzbrFnCWHULvmzw2DNb2"

# Create QR code instance
qr = qrcode.QRCode(version=1, box_size=10, border=5)

# Add data
qr.add_data(data)
qr.make(fit=True)

# Create image
img = qr.make_image(fill_color="black", back_color="white")

# Save image
img.save("qrcode.png")

img.show()  # Opens the image in the default viewer

