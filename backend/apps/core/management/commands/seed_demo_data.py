"""Comprehensive demo data seeder for presentations and evaluations.

Creates realistic student, vendor, warden, and admin accounts,
along with listings (with high-res photos) across all 4 domains,
inventory, sample orders with QR pickup PINs, hostel requests, and reviews.
"""

from decimal import Decimal
import random
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.inventory.models import Inventory
from apps.listings.models import (
    BookDetail,
    CanteenDetail,
    HostelSupplyDetail,
    Listing,
    Review,
    StationeryDetail,
)
from apps.orders.models import Order, OrderItem, OrderStatusLog
from apps.hostel_requests.models import HostelRequest, HostelRequestStatusLog
from apps.vendors.models import Vendor

User = get_user_model()


class Command(BaseCommand):
    help = "Seed rich, realistic demo data for presentations."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("=== SEEDING CAMPUS ERP DEMO DATA ==="))

        # 1. Accounts
        self.stdout.write("--> Creating demo users...")
        admin, _ = User.objects.get_or_create(
            email="admin@campus.edu",
            defaults={"name": "Campus ERP SuperAdmin", "role": "admin", "is_staff": True, "is_superuser": True},
        )
        admin.set_password("password123")
        admin.role = "admin"
        admin.is_superuser = True
        admin.is_staff = True
        admin.save()

        warden, _ = User.objects.get_or_create(
            email="warden@campus.edu",
            defaults={"name": "Dr. R. K. Gupta (Chief Warden)", "role": "warden", "phone": "+91 98111 22334"},
        )
        warden.set_password("password123")
        warden.role = "warden"
        warden.save()

        student, _ = User.objects.get_or_create(
            email="student@campus.edu",
            defaults={"name": "Aarav Sharma", "role": "student", "phone": "+91 98765 43210", "hostel_room": "B-204"},
        )
        student.set_password("password123")
        student.role = "student"
        student.hostel_room = "B-204"
        student.save()

        # 2. Vendors
        self.stdout.write("--> Setting up approved campus vendors...")
        vendors_def = [
            ("canteen@campus.edu", "Chef Vikram", "canteen", "Royal Campus Canteen", "Fresh artisanal meals, snacks, and beverages served daily right at the student hub."),
            ("stationery@campus.edu", "Suresh Patel", "stationery", "University Book & Stationery Hub", "Official campus provider for textbooks, notebooks, drafting instruments, and engineering supplies."),
            ("supplies@campus.edu", "Rajesh Verma", "hostel_supply", "Campus Living Essentials", "Premium hostel bedding, appliances, study lamps, and room hygiene products."),
        ]

        vendors = {}
        for email, vendor_name, vendor_type, biz_name, desc in vendors_def:
            v_user, _ = User.objects.get_or_create(
                email=email,
                defaults={"name": vendor_name, "role": "vendor", "phone": "+91 98222 33445"},
            )
            v_user.set_password("password123")
            v_user.role = "vendor"
            v_user.save()

            vendor, _ = Vendor.objects.get_or_create(
                user=v_user,
                defaults={
                    "business_name": biz_name,
                    "vendor_type": vendor_type,
                    "description": desc,
                    "contact_number": "+91 98222 33445",
                    "approval_status": Vendor.ApprovalStatus.APPROVED,
                },
            )
            vendor.approval_status = Vendor.ApprovalStatus.APPROVED
            vendor.save()
            vendors[vendor_type] = vendor

        # 3. Canteen Listings
        self.stdout.write("--> Seeding Canteen listings...")
        canteen_items = [
            ("Woodfired Margherita Pizza", "Fresh hand-tossed dough with San Marzano tomatoes, buffalo mozzarella, and fresh basil.", 180, "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80", True, 15, "11:00", "22:00"),
            ("Spicy Paneer Tikka Wrap", "Charcoal grilled cottage cheese tossed with mint chutney and crisp bell peppers in whole-wheat paratha.", 120, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=800&q=80", True, 10, "10:00", "21:00"),
            ("Classic Butter Chicken Bowl", "Tender smoked chicken in rich aromatic tomato butter gravy served over fragrant basmati jeera rice.", 220, "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=800&q=80", False, 15, "12:00", "22:00"),
            ("Iced Vanilla Cold Brew", "Slow-steeped Arabica coffee over ice with Madagascar vanilla cream.", 85, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80", True, 5, "08:00", "22:00"),
            ("Warm Chocolate Fudge Brownie", "Decadent dark chocolate brownie with melted fudge center.", 90, "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800&q=80", True, 5, "10:00", "22:00"),
        ]
        created_listings = []
        for title, desc, price, img, is_veg, prep, a_from, a_to in canteen_items:
            listing, _ = Listing.objects.update_or_create(
                title=title,
                vendor=vendors["canteen"],
                defaults={
                    "description": desc,
                    "price": Decimal(str(price)),
                    "category_type": "canteen",
                    "status": "active",
                    "image_url": img,
                },
            )
            CanteenDetail.objects.update_or_create(
                listing=listing,
                defaults={"is_veg": is_veg, "prep_time_minutes": prep, "available_from": a_from, "available_to": a_to},
            )
            Inventory.objects.update_or_create(listing=listing, defaults={"quantity": 60})
            created_listings.append(listing)

        # 4. Stationery Listings
        self.stdout.write("--> Seeding Stationery listings...")
        stationery_items = [
            ("Classmate Pulse Hardbound Notebook (200 Pgs)", "High-quality 70 GSM ruled paper with lay-flat spiral binding and perforated sheets.", 75, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80", "NB-200-PLS", "pieces"),
            ("Casio FX-991CW Advanced Scientific Calculator", "High-resolution 4-gradation display with 540+ mathematical functions for engineering.", 1290, "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48f?w=800&q=80", "CALC-FX991", "pieces"),
            ("Reynolds 0.7mm Ballpoint Pen (Pack of 10)", "Smooth laser-tip fluid ink flow in royal blue, perfect for exam papers.", 95, "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?w=800&q=80", "PEN-10-BLU", "pack"),
            ("Faber-Castell Pastel Highlighters (Set of 6)", "Water-based quick-drying pastel markers suitable for textbook annotating.", 150, "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80", "HL-6-PST", "set"),
        ]
        for title, desc, price, img, sku, unit in stationery_items:
            listing, _ = Listing.objects.update_or_create(
                title=title,
                vendor=vendors["stationery"],
                defaults={
                    "description": desc,
                    "price": Decimal(str(price)),
                    "category_type": "stationery",
                    "status": "active",
                    "image_url": img,
                },
            )
            StationeryDetail.objects.update_or_create(
                listing=listing,
                defaults={"sku": sku, "unit": unit},
            )
            Inventory.objects.update_or_create(listing=listing, defaults={"quantity": 40})
            created_listings.append(listing)

        # 5. Hostel Supply Listings
        self.stdout.write("--> Seeding Hostel Supply listings...")
        hostel_items = [
            ("1.8L Stainless Steel Electric Kettle", "Fast-boiling 1500W electric kettle with auto-cutoff and cool-touch handle.", 849, "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800&q=80", "Bedding & Furnishings"),
            ("Memory Foam Ergonomic Sleeping Pillow", "Breathable contoured support designed to relieve neck strain during late study nights.", 499, "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80", "Bedding & Furnishings"),
            ("Rechargeable LED Desk Study Lamp", "3-level touch dimmer with eye-caring warm/cool temperature modes and phone stand.", 650, "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80", "Bedding & Furnishings"),
        ]
        for title, desc, price, img, cat in hostel_items:
            listing, _ = Listing.objects.update_or_create(
                title=title,
                vendor=vendors["hostel_supply"],
                defaults={
                    "description": desc,
                    "price": Decimal(str(price)),
                    "category_type": "hostel_supply",
                    "status": "active",
                    "image_url": img,
                },
            )
            HostelSupplyDetail.objects.update_or_create(
                listing=listing,
                defaults={"supply_category": cat},
            )
            Inventory.objects.update_or_create(listing=listing, defaults={"quantity": 30})
            created_listings.append(listing)

        # 6. Second-hand Books (Student P2P)
        self.stdout.write("--> Seeding Student Book listings...")
        book_items = [
            ("Introduction to Algorithms (CLRS) 4th Edition", "Classic MIT textbook. Pristine condition with no pencil markings, includes supplemental CD.", 620, "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80", "Thomas H. Cormen", "Computer Science", "4th", "good"),
            ("Clean Code: Agile Software Craftsmanship", "Essential software engineering best practices handbook. Lightly highlighted on chapter 3.", 450, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80", "Robert C. Martin", "Software Engineering", "1st", "fair"),
            ("Engineering Mechanics: Statics & Dynamics", "Standard engineering syllabus book with solved previous year questions.", 320, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80", "R. C. Hibbeler", "Mechanical Engineering", "14th", "good"),
        ]
        for title, desc, price, img, author, subject, edition, cond in book_items:
            listing, _ = Listing.objects.update_or_create(
                title=title,
                vendor=None,
                defaults={
                    "description": desc,
                    "price": Decimal(str(price)),
                    "category_type": "book",
                    "status": "active",
                    "image_url": img,
                },
            )
            BookDetail.objects.update_or_create(
                listing=listing,
                defaults={
                    "seller": student,
                    "author": author,
                    "subject": subject,
                    "edition": edition,
                    "condition": cond,
                    "is_available": True,
                },
            )

        # 7. Reviews
        self.stdout.write("--> Seeding Reviews and ratings...")
        sample_reviews = [
            ("Woodfired Margherita Pizza", 5, "Best pizza on campus by far! Crust is super crispy and cheese is fresh."),
            ("Spicy Paneer Tikka Wrap", 4, "Really flavorful and hot, great for a quick lunch between lectures."),
            ("Casio FX-991CW Advanced Scientific Calculator", 5, "Lifesaver in thermodynamics and calculus exams. Genuine product."),
            ("1.8L Stainless Steel Electric Kettle", 5, "Boils water in 90 seconds. Essential for midnight noodles!"),
        ]
        for title, rating, comment in sample_reviews:
            l = Listing.objects.filter(title=title).first()
            if l:
                Review.objects.update_or_create(
                    listing=l,
                    user=student,
                    defaults={"rating": rating, "comment": comment},
                )

        # 8. Sample Active Orders with QR Pickup PINs
        self.stdout.write("--> Seeding Sample Orders...")
        pizza = Listing.objects.filter(title="Woodfired Margherita Pizza").first()
        cold_brew = Listing.objects.filter(title="Iced Vanilla Cold Brew").first()
        if pizza and cold_brew:
            # Order 1: READY for pickup with PIN 4821
            order1, _ = Order.objects.get_or_create(
                user=student,
                pickup_slot="Lunch Slot (12:30 PM)",
                status=Order.Status.READY,
                defaults={
                    "total_amount": Decimal("265.00"),
                    "payment_method": "stripe",
                    "payment_status": "paid",
                    "payment_reference": "stripe-ch_3Pz7xL2eZvKYlo2C",
                    "pickup_pin": "4821",
                },
            )
            order1.pickup_pin = "4821"
            order1.status = Order.Status.READY
            order1.payment_status = "paid"
            order1.payment_method = "stripe"
            order1.save()

            OrderItem.objects.get_or_create(
                order=order1,
                listing=pizza,
                defaults={
                    "vendor": vendors["canteen"],
                    "title_snapshot": pizza.title,
                    "vendor_name_snapshot": vendors["canteen"].business_name,
                    "quantity": 1,
                    "price_at_order": pizza.price,
                    "subtotal": pizza.price,
                },
            )
            OrderItem.objects.get_or_create(
                order=order1,
                listing=cold_brew,
                defaults={
                    "vendor": vendors["canteen"],
                    "title_snapshot": cold_brew.title,
                    "vendor_name_snapshot": vendors["canteen"].business_name,
                    "quantity": 1,
                    "price_at_order": cold_brew.price,
                    "subtotal": cold_brew.price,
                },
            )

        # 9. Hostel Supply Requests
        self.stdout.write("--> Seeding Hostel Supply Requests...")
        pillow = Listing.objects.filter(title="Memory Foam Ergonomic Sleeping Pillow").first()
        kettle = Listing.objects.filter(title="1.8L Stainless Steel Electric Kettle").first()
        from datetime import date, timedelta
        if pillow:
            hr1, _ = HostelRequest.objects.get_or_create(
                student=student,
                listing=pillow,
                defaults={
                    "quantity": 1,
                    "required_by_date": date.today() + timedelta(days=2),
                    "special_instructions": "Room B-204, delivery after 4 PM preferred.",
                    "status": HostelRequest.Status.SUBMITTED,
                    "assigned_warden": warden,
                },
            )
        if kettle:
            hr2, _ = HostelRequest.objects.get_or_create(
                student=student,
                listing=kettle,
                defaults={
                    "quantity": 1,
                    "required_by_date": date.today() + timedelta(days=1),
                    "special_instructions": "Room B-204, urgent for exam preparation.",
                    "status": HostelRequest.Status.APPROVED,
                    "assigned_warden": warden,
                    "warden_notes": "Approved for hostel electrical safety compliance.",
                },
            )

        self.stdout.write(self.style.SUCCESS("\n=== DEMO DATA SEEDED SUCCESSFULLY! ==="))
        self.stdout.write("DEMO ACCOUNTS (Password for all: password123):")
        self.stdout.write("  Student:  student@campus.edu")
        self.stdout.write("  Canteen:  canteen@campus.edu")
        self.stdout.write("  Stationery: stationery@campus.edu")
        self.stdout.write("  Warden:   warden@campus.edu")
        self.stdout.write("  Admin:    admin@campus.edu")
