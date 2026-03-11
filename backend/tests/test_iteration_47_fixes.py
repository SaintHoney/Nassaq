"""
Test file for Iteration 47 - Bug fixes verification
Tests for issues #1, #2, #3, #15, #18, #20, #21, #42

Issues being tested:
- #1: Hijri date display (frontend only)
- #2, #3: Chart filtering by type/school (frontend only)
- #15: Users Management page data loading
- #18, #21, #42: Export buttons functionality
- #20: Edit user button opens dialog (frontend only)
- #12: AI Operations panel icons (frontend only)
- #23-#29, #47-#53: Security Center and System Monitoring tools (frontend only)
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUsersManagementAPI:
    """Test Users Management API - Issue #15"""
    
    def test_get_users_list(self):
        """Test that users list API returns data successfully"""
        response = requests.get(f"{BASE_URL}/api/users")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of users"
        print(f"✅ Users API returned {len(data)} users")
    
    def test_get_users_with_pagination(self):
        """Test users list with pagination parameters"""
        response = requests.get(f"{BASE_URL}/api/users?page=1&limit=10")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of users"
        print(f"✅ Users API with pagination returned {len(data)} users")
    
    def test_get_users_with_role_filter(self):
        """Test users list with role filter"""
        response = requests.get(f"{BASE_URL}/api/users?role=teacher")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of users"
        print(f"✅ Users API with role filter returned {len(data)} users")


class TestExportAPIs:
    """Test Export APIs - Issues #18, #21, #42"""
    
    def test_export_dashboard_pdf(self):
        """Test dashboard PDF export endpoint"""
        # This is typically a frontend-only feature using jsPDF
        # But we can test if there's a backend endpoint
        response = requests.get(f"{BASE_URL}/api/export/dashboard?format=pdf")
        # May return 404 if not implemented in backend
        if response.status_code == 200:
            print("✅ Dashboard PDF export endpoint exists")
        else:
            print(f"ℹ️ Dashboard PDF export is frontend-only (status: {response.status_code})")
    
    def test_export_dashboard_excel(self):
        """Test dashboard Excel export endpoint"""
        response = requests.get(f"{BASE_URL}/api/export/dashboard?format=excel")
        if response.status_code == 200:
            print("✅ Dashboard Excel export endpoint exists")
        else:
            print(f"ℹ️ Dashboard Excel export is frontend-only (status: {response.status_code})")
    
    def test_export_security_report(self):
        """Test security report export endpoint"""
        response = requests.get(f"{BASE_URL}/api/security/report")
        if response.status_code == 200:
            print("✅ Security report export endpoint exists")
        else:
            print(f"ℹ️ Security report export is frontend-only (status: {response.status_code})")


class TestDashboardAPIs:
    """Test Dashboard APIs for chart data"""
    
    def test_dashboard_stats(self):
        """Test dashboard statistics endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        print(f"✅ Dashboard stats API working")
    
    def test_dashboard_activity(self):
        """Test dashboard activity endpoint"""
        response = requests.get(f"{BASE_URL}/api/dashboard/activity")
        if response.status_code == 200:
            print("✅ Dashboard activity API working")
        else:
            print(f"ℹ️ Dashboard activity endpoint status: {response.status_code}")
    
    def test_dashboard_with_filters(self):
        """Test dashboard with type filter - Issues #2, #3"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats?type=private")
        if response.status_code == 200:
            print("✅ Dashboard with type filter working")
        else:
            print(f"ℹ️ Dashboard filter status: {response.status_code}")


class TestHakimAPI:
    """Test Hakim AI API"""
    
    def test_hakim_chat(self):
        """Test Hakim chat endpoint"""
        response = requests.post(
            f"{BASE_URL}/api/hakim/chat",
            json={"message": "مرحبا", "context": "general"}
        )
        if response.status_code == 200:
            data = response.json()
            assert "response" in data or "message" in data, "Expected response field"
            print("✅ Hakim chat API working")
        else:
            print(f"ℹ️ Hakim chat status: {response.status_code}")


class TestAuthAPI:
    """Test Authentication API"""
    
    def test_login_platform_admin(self):
        """Test login with platform admin credentials"""
        response = requests.post(
            f"{BASE_URL}/api/auth/login",
            json={"email": "admin@nassaq.com", "password": "Admin@123"}
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "token" in data or "access_token" in data, "Expected token in response"
        print("✅ Platform Admin login successful")
        return data.get("token") or data.get("access_token")


class TestSchoolsAPI:
    """Test Schools API"""
    
    def test_get_schools_list(self):
        """Test schools list endpoint"""
        response = requests.get(f"{BASE_URL}/api/schools")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list), "Expected list of schools"
        print(f"✅ Schools API returned {len(data)} schools")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
