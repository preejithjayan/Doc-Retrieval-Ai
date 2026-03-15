from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework.test import APITestCase

from apps.users.models import Role


@override_settings(ALLOWED_HOSTS=['testserver', 'localhost', '127.0.0.1'])
class AuthenticationFlowTests(APITestCase):
    def test_register_creates_viewer_user(self):
        response = self.client.post(
            '/api/auth/register',
            {
                'email': 'register-user@example.com',
                'first_name': 'Register',
                'last_name': 'User',
                'password': 'Password123!',
                'confirm_password': 'Password123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.data['success'])
        self.assertEqual(response.data['user']['role_code'], Role.Code.VIEWER)

        user = get_user_model().objects.get(email='register-user@example.com')
        self.assertEqual(user.role.code, Role.Code.VIEWER)

    def test_login_returns_tokens_and_user_payload(self):
        viewer_role = Role.objects.get(code=Role.Code.VIEWER)
        user = get_user_model().objects.create_user(
            email='login-user@example.com',
            password='Password123!',
            first_name='Login',
            last_name='User',
            role=viewer_role,
        )

        response = self.client.post(
            '/api/auth/login',
            {
                'email': user.email,
                'password': 'Password123!',
            },
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], user.email)
        self.assertEqual(response.data['user']['role_code'], Role.Code.VIEWER)
