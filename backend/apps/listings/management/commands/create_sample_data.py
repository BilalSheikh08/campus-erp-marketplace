"""Management command to create sample marketplace data for testing."""

from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.vendors.models import Vendor
from apps.listings.models import Listing, CanteenDetail, StationeryDetail, HostelSupplyDetail, BookDetail
from apps.inventory.models import Inventory

User = get_user_model()


class Command(BaseCommand):
    help = 'Create sample marketplace listings for testing Phase B'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=== Creating Sample Marketplace Data ===\n'))

        # Get or create admin
        admin = User.objects.filter(role='admin').first()
        if not admin:
            admin = User.objects.create_superuser(
                email='admin@example.com',
                password='admin123',
                name='Admin User'
            )
            admin.role = 'admin'
            admin.save()
            self.stdout.write(f'[created] Created admin: {admin.email}')

        # Get a student for book seller
        student = User.objects.filter(role='student').first()

        # Create/approve vendors for each domain
        vendors_to_create = [
            ('canteen', 'Campus Canteen', 'Canteen'),
            ('stationery', 'Campus Store', 'Stationery'),
            ('hostel_supply', 'Hostel Services', 'Hostel Supplies'),
        ]

        vendors = {}
        self.stdout.write('\n--- Setting up Vendors ---')
        for vendor_type, business_name, display_name in vendors_to_create:
            # Check if vendor already exists
            existing = Vendor.objects.filter(vendor_type=vendor_type).first()
            if existing:
                vendor = existing
                self.stdout.write(f'[existing] Using existing vendor: {business_name}')
            else:
                # Create vendor user
                vendor_user = User.objects.create_user(
                    email=f'{vendor_type}@example.com',
                    password='vendor123',
                    name=f'{display_name} Vendor',
                    role='vendor'
                )
                # Create vendor profile
                vendor = Vendor.objects.create(
                    user=vendor_user,
                    business_name=business_name,
                    vendor_type=vendor_type,
                    description=f'Official {display_name} Provider'
                )
                self.stdout.write(f'[created] Created vendor: {business_name}')

            # Approve if not already approved
            if vendor.approval_status != Vendor.ApprovalStatus.APPROVED:
                vendor.approve(admin)
                self.stdout.write(f'  [approved]')

            vendors[vendor_type] = vendor

        # Create canteen listings
        self.stdout.write('\n--- Canteen Listings ---')
        canteen_items = [
            ('Margherita Pizza', 'Fresh margherita pizza', 150, True, 15, '11:00', '14:00'),
            ('Chicken Biryani', 'Fragrant rice with chicken', 200, False, 20, '12:00', '15:00'),
            ('Masala Dosa', 'South Indian breakfast', 80, True, 10, '08:00', '11:00'),
            ('Paneer Butter Masala', 'Creamy paneer curry', 180, True, 25, '12:00', '15:00'),
        ]
        for title, desc, price, is_veg, prep_time, avail_from, avail_to in canteen_items:
            listing, created = Listing.objects.get_or_create(
                title=title,
                category_type='canteen',
                defaults={
                    'description': desc,
                    'price': price,
                    'vendor': vendors['canteen'],
                    'status': 'active'
                }
            )
            if created:
                CanteenDetail.objects.create(
                    listing=listing,
                    is_veg=is_veg,
                    prep_time_minutes=prep_time,
                    available_from=avail_from,
                    available_to=avail_to
                )
                self.stdout.write(f'[created] {title}')
            else:
                self.stdout.write(f'[exists] {title}')

        # Create stationery listings
        self.stdout.write('\n--- Stationery Listings ---')
        stationery_items = [
            ('Notebook - 100 pages', 'Ruled notebook', 50, 'NB-100-A4', 'pieces'),
            ('Ball Pen Pack (10)', 'Premium blue pens', 75, 'PEN-10-BLUE', 'pack'),
            ('Highlighter Set (5)', 'Vibrant colors', 120, 'HL-5-COLOR', 'pack'),
            ('A4 File', 'Durable folder', 40, 'FILE-A4', 'pieces'),
            ('Pencil Set', 'Graphite pencils', 60, 'PENCIL-12', 'set'),
        ]
        for title, desc, price, sku, unit in stationery_items:
            listing, created = Listing.objects.get_or_create(
                title=title,
                category_type='stationery',
                defaults={
                    'description': desc,
                    'price': price,
                    'vendor': vendors['stationery'],
                    'status': 'active'
                }
            )
            if created:
                StationeryDetail.objects.get_or_create(
                    listing=listing,
                    defaults={'sku': sku, 'unit': unit}
                )
                self.stdout.write(f'[created] {title}')
            else:
                self.stdout.write(f'[exists] {title}')

        # Create hostel supply listings
        self.stdout.write('\n--- Hostel Supply Listings ---')
        hostel_items = [
            ('Extra Bedsheet', 'Cotton bedsheet', 300),
            ('Pillow', 'Comfortable pillow', 400),
            ('Study Table Lamp', 'LED with brightness control', 800),
            ('Mosquito Net', 'Durable net', 200),
        ]
        for title, desc, price in hostel_items:
            listing, created = Listing.objects.get_or_create(
                title=title,
                category_type='hostel_supply',
                defaults={
                    'description': desc,
                    'price': price,
                    'vendor': vendors['hostel_supply'],
                    'status': 'active'
                }
            )
            if created:
                HostelSupplyDetail.objects.get_or_create(
                    listing=listing,
                    defaults={'supply_category': 'Bedding & Furnishings'}
                )
                self.stdout.write(f'[created] {title}')
            else:
                self.stdout.write(f'[exists] {title}')

        # Create book listings (student-owned)
        self.stdout.write('\n--- Book Listings ---')
        if student:
            book_items = [
                ('Data Structures and Algorithms', 'Cormen & Leiserson', 'Computer Science', '3rd', 'good', 350),
                ('Organic Chemistry', 'Morrison & Boyd', 'Chemistry', '2nd', 'fair', 250),
                ('Linear Algebra', 'Gilbert Strang', 'Mathematics', '4th', 'good', 400),
                ('Physics for Engineers', 'HC Verma', 'Physics', '1st', 'worn', 150),
            ]
            for title, author, subject, edition, condition, price in book_items:
                listing, created = Listing.objects.get_or_create(
                    title=title,
                    category_type='book',
                    defaults={
                        'description': f'{subject} textbook',
                        'price': price,
                        'vendor': None,
                        'status': 'active'
                    }
                )
                if created:
                    BookDetail.objects.create(
                        listing=listing,
                        seller=student,
                        author=author,
                        subject=subject,
                        edition=edition,
                        condition=condition
                    )
                    self.stdout.write(f'[created] {title}')
                else:
                    self.stdout.write(f'[exists] {title} (already exists)')
        else:
            self.stdout.write(self.style.WARNING('[warning] No student found - skipping books'))

        # Create inventory for vendor listings only (not books)
        self.stdout.write('\n--- Creating Inventory ---')
        for listing in Listing.objects.exclude(category_type='book'):
            inventory, created = Inventory.objects.get_or_create(
                listing=listing,
                defaults={'quantity': 50}
            )
            if created:
                self.stdout.write(f'[created] {listing.title}: {inventory.quantity} units')

        # Final summary
        self.stdout.write(self.style.SUCCESS('\n=== SUMMARY ==='))
        self.stdout.write(f'Total listings: {Listing.objects.count()}')
        for category in ['canteen', 'stationery', 'hostel_supply', 'book']:
            count = Listing.objects.filter(category_type=category).count()
            self.stdout.write(f'  {category}: {count}')

        self.stdout.write(f'\nVendors: {Vendor.objects.count()}')
        for vendor in Vendor.objects.all():
            status = vendor.approval_status.upper()
            count = vendor.listings.count()
            self.stdout.write(f'  {vendor.business_name}: {count} listings ({status})')
