from django.apps import AppConfig
import sys

class ExamsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'exams'

    def ready(self):
        # List of commands that SHOULD trigger seeding (server start)
        # Or simply check if we are NOT running a migration/setup command
        excluded_commands = ['migrate', 'makemigrations', 'collectstatic', 'test', 'flush', 'shell']
        is_excluded = any(cmd in sys.argv for cmd in excluded_commands)
        
        if not is_excluded:
            try:
                from exams.models import ExamType
                # Use a lightweight check to see if database is ready and empty
                if ExamType.objects.exists():
                    return
                
                print("Auto-seeding initial exam data...")
                from django.core.management import call_command
                call_command('seed_data')
            except Exception:
                # Silently skip if DB not ready or other issues
                pass
