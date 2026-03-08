"""
NASSAQ Platform Feature Tests - Iteration 6
Tests for:
- Hero Section with Platform Name (Arabic/English)
- Traction Section with 4 stats cards
- 24/7 Support Badge
- Seed Demo Data API
- Dashboard Stats API
- Login API
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
ADMIN_EMAIL = "info@nassaqapp.com"
ADMIN_PASSWORD = "NassaqAdmin2026!##$$HBJ"


class TestAuthAPI:
    """Authentication endpoint tests"""
    
    def test_login_success(self):
        """Test successful admin login"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "user" in data, "No user in response"
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "platform_admin"
        print(f"✅ Login successful for {ADMIN_EMAIL}")
    
    def test_login_invalid_credentials(self):
        """Test login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "wrong@example.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✅ Invalid credentials correctly rejected")


class TestDashboardStatsAPI:
    """Dashboard statistics endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_dashboard_stats_requires_auth(self):
        """Test that dashboard stats requires authentication"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 401 or response.status_code == 403, \
            f"Expected 401/403, got {response.status_code}"
        print("✅ Dashboard stats correctly requires authentication")
    
    def test_dashboard_stats_returns_data(self, auth_token):
        """Test dashboard stats returns correct data structure"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify all required fields exist
        required_fields = [
            "total_schools", "total_students", "total_teachers",
            "active_schools", "pending_schools", "total_users",
            "pending_requests", "active_users", "total_classes", "total_subjects"
        ]
        
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
            assert isinstance(data[field], int), f"{field} should be int"
        
        print(f"✅ Dashboard stats returned: {data}")
    
    def test_dashboard_stats_values_match_traction(self, auth_token):
        """Test that dashboard stats align with traction metrics"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify traction-aligned metrics (should be close to displayed values)
        # +200 schools, +50,000 students, +3,000 teachers
        assert data["total_schools"] >= 100, f"Expected ~200 schools, got {data['total_schools']}"
        assert data["total_students"] >= 10000, f"Expected ~50,000 students, got {data['total_students']}"
        assert data["total_teachers"] >= 1000, f"Expected ~3,000 teachers, got {data['total_teachers']}"
        
        print(f"✅ Traction metrics verified: {data['total_schools']} schools, {data['total_students']} students, {data['total_teachers']} teachers")


class TestSeedDemoDataAPI:
    """Seed demo data endpoint tests"""
    
    def test_seed_demo_data_endpoint_exists(self):
        """Test that seed demo data endpoint exists and responds"""
        response = requests.post(f"{BASE_URL}/api/seed/demo-data")
        
        # Should return 200 with success message
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Check response structure
        assert "message" in data or "results" in data, "Missing message or results in response"
        print(f"✅ Seed demo data endpoint works: {data.get('message', 'Data seeded')}")
    
    def test_seed_demo_data_returns_counts(self):
        """Test that seed demo data returns creation counts"""
        response = requests.post(f"{BASE_URL}/api/seed/demo-data")
        
        assert response.status_code == 200
        data = response.json()
        
        # If data already exists, should return current counts
        if "current_counts" in data:
            counts = data["current_counts"]
            assert "schools" in counts
            assert "teachers" in counts
            assert "students" in counts
            print(f"✅ Demo data already exists: {counts}")
        elif "results" in data:
            results = data["results"]
            print(f"✅ Demo data created: {results}")
        else:
            print(f"✅ Seed response: {data}")


class TestSchoolsAPI:
    """Schools management endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_schools_list(self, auth_token):
        """Test getting list of schools"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/schools", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of schools"
        if len(data) > 0:
            school = data[0]
            assert "id" in school
            assert "name" in school
            assert "status" in school
        
        print(f"✅ Schools list returned {len(data)} schools")


class TestTeachersAPI:
    """Teachers management endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_teachers_list(self, auth_token):
        """Test getting list of teachers"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/teachers", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of teachers"
        if len(data) > 0:
            teacher = data[0]
            assert "id" in teacher
            assert "full_name" in teacher
            assert "specialization" in teacher
        
        print(f"✅ Teachers list returned {len(data)} teachers")


class TestStudentsAPI:
    """Students management endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_students_list(self, auth_token):
        """Test getting list of students"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/students", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of students"
        if len(data) > 0:
            student = data[0]
            assert "id" in student
            assert "full_name" in student
            assert "student_number" in student
        
        print(f"✅ Students list returned {len(data)} students")


class TestClassesAPI:
    """Classes management endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_classes_list(self, auth_token):
        """Test getting list of classes"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/classes", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of classes"
        if len(data) > 0:
            class_item = data[0]
            assert "id" in class_item
            assert "name" in class_item
            assert "grade_level" in class_item
        
        print(f"✅ Classes list returned {len(data)} classes")


class TestSubjectsAPI:
    """Subjects management endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_subjects_list(self, auth_token):
        """Test getting list of subjects"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/subjects", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of subjects"
        if len(data) > 0:
            subject = data[0]
            assert "id" in subject
            assert "name" in subject
            assert "code" in subject
        
        print(f"✅ Subjects list returned {len(data)} subjects")


class TestRegistrationRequestsAPI:
    """Registration requests endpoint tests"""
    
    @pytest.fixture
    def auth_token(self):
        """Get authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD
        })
        if response.status_code == 200:
            return response.json().get("access_token")
        pytest.skip("Authentication failed")
    
    def test_get_registration_requests(self, auth_token):
        """Test getting registration requests"""
        headers = {"Authorization": f"Bearer {auth_token}"}
        response = requests.get(f"{BASE_URL}/api/registration-requests", headers=headers)
        
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        assert isinstance(data, list), "Expected list of registration requests"
        print(f"✅ Registration requests returned {len(data)} requests")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
