# Generated manually because the build environment does not include Django at authoring time.
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="bookdetail",
            name="is_available",
            field=models.BooleanField(db_index=True, default=True),
        ),
    ]
