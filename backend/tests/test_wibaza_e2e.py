"""End-to-end backend tests for WIBAZA marketplace.
Covers: health, auth (admin/seller/client), admin stats, categories,
seller approval, products (create/approve/list), cart, orders, payments (stripe checkout),
uploads (cloudinary), banners, announcements, admin ban/delete/commissions/stock/products/payments.

Uses cookie-based auth (httponly). We use requests.Session per role to persist cookies.
Test data is prefixed with TEST_ / uses timestamped emails so runs are idempotent.
"""
import os
import io
import time
import uuid
import base64
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://marketplace-wibaza.preview.emergentagent.com').rstrip('/')
API = f"{BASE_URL}/api"

ADMIN_EMAIL = 'admin@wibaza.com'
ADMIN_PASSWORD = 'Admin@Wibaza2026'

TS = int(time.time())
SELLER_EMAIL = f'test_seller_{TS}@example.com'
CLIENT_EMAIL = f'test_client_{TS}@example.com'
PASSWORD = 'TestPass@2026'

# Shared state across tests
STATE = {}


@pytest.fixture(scope='session')
def admin():
    s = requests.Session()
    r = s.post(f"{API}/auth/login", json={'email': ADMIN_EMAIL, 'password': ADMIN_PASSWORD})
    assert r.status_code == 200, f'Admin login failed: {r.status_code} {r.text}'
    STATE['admin_user'] = r.json()
    return s


@pytest.fixture(scope='session')
def seller_session():
    return requests.Session()


@pytest.fixture(scope='session')
def client_session():
    return requests.Session()


# ---------- Health ----------

def test_health():
    r = requests.get(f"{API}/health")
    assert r.status_code == 200
    assert r.json().get('status') == 'healthy'


# ---------- Admin auth & stats ----------

def test_admin_login_and_me(admin):
    r = admin.get(f"{API}/auth/me")
    assert r.status_code == 200, r.text
    data = r.json()
    assert data.get('email') == ADMIN_EMAIL
    assert data.get('role') == 'admin'


def test_admin_stats(admin):
    r = admin.get(f"{API}/admin/stats")
    assert r.status_code == 200, r.text
    d = r.json()
    for k in ['total_users', 'total_sellers', 'total_clients', 'total_products',
              'total_orders', 'platform_commission', 'pending_commissions']:
        assert k in d, f'Missing key {k} in stats: {d}'
    assert isinstance(d['total_users'], int)


# ---------- Categories ----------

def test_create_category_as_admin(admin):
    name = f'TEST_Cat_{TS}'
    # Router uses '/' route
    r = admin.post(f"{API}/categories/", json={'name': name, 'description': 'Test category'})
    if r.status_code in (307, 308):
        # follow manually
        r = admin.post(f"{API}/categories", json={'name': name, 'description': 'Test category'})
    assert r.status_code in (200, 201), f'create category: {r.status_code} {r.text}'
    d = r.json()
    assert 'id' in d
    assert d['name'] == name
    STATE['category_id'] = d['id']


def test_list_categories_public():
    r = requests.get(f"{API}/categories")
    assert r.status_code == 200
    cats = r.json()
    assert isinstance(cats, list)
    assert any(c['id'] == STATE.get('category_id') for c in cats), 'Created category not listed'


# ---------- Seller register & approval ----------

def test_register_seller(seller_session):
    r = seller_session.post(f"{API}/auth/register", json={
        'email': SELLER_EMAIL,
        'password': PASSWORD,
        'name': 'Test Seller',
        'role': 'seller',
    })
    assert r.status_code == 200, f'seller register: {r.status_code} {r.text}'
    d = r.json()
    assert d['email'] == SELLER_EMAIL
    assert d['role'] == 'seller'
    assert d.get('is_approved') is False, 'Seller should be pending approval'
    STATE['seller_id'] = d['id']
    # Clear cookies so seller can't stay logged in (they shouldn't be able to login until approved)
    seller_session.cookies.clear()


def test_pending_seller_login_forbidden(seller_session):
    r = seller_session.post(f"{API}/auth/login", json={'email': SELLER_EMAIL, 'password': PASSWORD})
    assert r.status_code == 403, f'Expected 403 for pending seller, got {r.status_code} {r.text}'
    seller_session.cookies.clear()


def test_admin_approve_seller(admin):
    sid = STATE['seller_id']
    r = admin.post(f"{API}/admin/sellers/{sid}/approve", params={'approved': 'true'})
    assert r.status_code == 200, f'approve seller: {r.status_code} {r.text}'


def test_approved_seller_login(seller_session):
    r = seller_session.post(f"{API}/auth/login", json={'email': SELLER_EMAIL, 'password': PASSWORD})
    assert r.status_code == 200, f'seller login post-approval: {r.status_code} {r.text}'
    d = r.json()
    assert d['role'] == 'seller'


# ---------- Products ----------

def test_seller_creates_product_pending(seller_session):
    payload = {
        'name': f'TEST_Product_{TS}',
        'description': 'A test product',
        'category_id': STATE['category_id'],
        'price': 19.99,
        'stock': 100,
        'images': ['https://via.placeholder.com/300'],
    }
    r = seller_session.post(f"{API}/products", json=payload)
    assert r.status_code == 200, f'create product: {r.status_code} {r.text}'
    d = r.json()
    assert d['approval_status'] == 'pending'
    assert d['seller_id'] == STATE['seller_id']
    STATE['product_id'] = d['id']


def test_pending_product_not_in_public_list():
    r = requests.get(f"{API}/products")
    assert r.status_code == 200
    d = r.json()
    ids = [p['id'] for p in d['products']]
    assert STATE['product_id'] not in ids, 'Pending product should not appear publicly'


def test_admin_approve_product(admin):
    pid = STATE['product_id']
    r = admin.post(f"{API}/products/{pid}/approve", params={'approved': 'true'})
    assert r.status_code == 200, r.text


def test_approved_product_in_public_list():
    r = requests.get(f"{API}/products", params={'limit': 100})
    assert r.status_code == 200
    d = r.json()
    ids = [p['id'] for p in d['products']]
    assert STATE['product_id'] in ids, 'Approved product should appear in public list'


# ---------- Client register, cart, order, payment ----------

def test_register_client(client_session):
    r = client_session.post(f"{API}/auth/register", json={
        'email': CLIENT_EMAIL,
        'password': PASSWORD,
        'name': 'Test Client',
        'role': 'client',
    })
    assert r.status_code == 200, f'client register: {r.status_code} {r.text}'
    d = r.json()
    STATE['client_id'] = d['id']


def test_add_to_cart(client_session):
    # Real endpoint is /api/cart/items (add_to_cart), request tolerates both.
    r = client_session.post(f"{API}/cart/items", json={
        'product_id': STATE['product_id'],
        'quantity': 2,
    })
    assert r.status_code == 200, f'add to cart: {r.status_code} {r.text}'
    # verify persistence
    g = client_session.get(f"{API}/cart")
    assert g.status_code == 200
    cart = g.json()
    prods = [i['product_id'] for i in cart.get('items', [])]
    assert STATE['product_id'] in prods


def test_create_order(client_session):
    payload = {
        'items': [{
            'product_id': STATE['product_id'],
            'product_name': f'TEST_Product_{TS}',
            'seller_id': STATE['seller_id'],
            'quantity': 2,
            'unit_price': 19.99,
            'total_price': 39.98,
        }],
        'shipping_address': {'line1': '1 Test St', 'city': 'Test', 'country': 'US', 'zip': '00000'},
        'billing_address': {'line1': '1 Test St', 'city': 'Test', 'country': 'US', 'zip': '00000'},
    }
    r = client_session.post(f"{API}/orders", json=payload)
    assert r.status_code == 200, f'create order: {r.status_code} {r.text}'
    d = r.json()
    assert d['payment_status'] == 'pending'
    assert d['total'] == 39.98
    STATE['order_id'] = d['id']


def test_stripe_checkout(client_session):
    r = client_session.post(f"{API}/payments/checkout", params={'order_id': STATE['order_id']})
    assert r.status_code == 200, f'checkout: {r.status_code} {r.text}'
    d = r.json()
    assert 'checkout_url' in d and d['checkout_url'].startswith('http')
    assert 'session_id' in d and d['session_id']
    STATE['session_id'] = d['session_id']


# ---------- Uploads (Cloudinary) ----------

# Minimal 1x1 PNG bytes
PNG_1X1 = base64.b64decode(
    b'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
)


def test_upload_image_cloudinary(client_session):
    files = {'file': ('test.png', PNG_1X1, 'image/png')}
    r = client_session.post(f"{API}/uploads/image", files=files)
    assert r.status_code == 200, f'upload: {r.status_code} {r.text}'
    d = r.json()
    # cloudinary returns url or secure_url typically
    url = d.get('secure_url') or d.get('url')
    assert url and 'cloudinary.com' in url, f'Unexpected upload response: {d}'


# ---------- Banners ----------

def test_admin_create_banner(admin):
    r = admin.post(f"{API}/banners", json={
        'title': f'TEST_Banner_{TS}',
        'subtitle': 'sub',
        'image_url': 'https://via.placeholder.com/600',
        'link_url': '',
        'order': 0,
        'is_active': True,
    })
    assert r.status_code == 200, r.text
    STATE['banner_id'] = r.json()['id']


def test_list_banners_public():
    r = requests.get(f"{API}/banners")
    assert r.status_code == 200
    ids = [b['id'] for b in r.json()]
    assert STATE['banner_id'] in ids


def test_admin_list_all_banners(admin):
    r = admin.get(f"{API}/banners/all")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Announcements ----------

def test_admin_create_announcement(admin):
    r = admin.post(f"{API}/announcements", json={
        'title': f'TEST_Ann_{TS}',
        'message': 'hello',
        'placement': 'home_top',
        'is_active': True,
    })
    assert r.status_code == 200, r.text
    STATE['announcement_id'] = r.json()['id']


def test_list_announcements_public():
    r = requests.get(f"{API}/announcements")
    assert r.status_code == 200
    ids = [a['id'] for a in r.json()]
    assert STATE['announcement_id'] in ids


# ---------- Admin ban/unban/delete ----------

def test_admin_ban_client(admin, client_session):
    cid = STATE['client_id']
    r = admin.post(f"{API}/admin/users/{cid}/ban", params={'banned': 'true'})
    assert r.status_code == 200, r.text

    # Banned user login should be 403
    fresh = requests.Session()
    login = fresh.post(f"{API}/auth/login", json={'email': CLIENT_EMAIL, 'password': PASSWORD})
    assert login.status_code == 403, f'Banned login should be 403, got {login.status_code} {login.text}'


def test_admin_unban_and_delete_client(admin):
    cid = STATE['client_id']
    r = admin.post(f"{API}/admin/users/{cid}/ban", params={'banned': 'false'})
    assert r.status_code == 200
    # Now delete
    r = admin.delete(f"{API}/admin/users/{cid}")
    assert r.status_code == 200, r.text
    # After soft delete, login should fail (user not found)
    fresh = requests.Session()
    login = fresh.post(f"{API}/auth/login", json={'email': CLIENT_EMAIL, 'password': PASSWORD})
    assert login.status_code in (401, 403, 404), f'Deleted user should not login, got {login.status_code}'


# ---------- Commissions ----------

def test_generate_commissions(admin):
    r = admin.post(f"{API}/admin/commissions/generate")
    assert r.status_code == 200, r.text
    d = r.json()
    assert 'created' in d
    # Order hasn't been paid via Stripe, so expected 0
    STATE['commissions_created'] = d['created']


def test_list_commissions(admin):
    r = admin.get(f"{API}/admin/commissions")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Admin stock/products/payments overviews ----------

def test_admin_stock(admin):
    r = admin.get(f"{API}/admin/stock")
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list)
    # our product should be in there with seller info
    ours = next((p for p in lst if p['id'] == STATE['product_id']), None)
    assert ours is not None
    assert 'seller' in ours


def test_admin_products(admin):
    r = admin.get(f"{API}/admin/products")
    assert r.status_code == 200
    lst = r.json()
    ours = next((p for p in lst if p['id'] == STATE['product_id']), None)
    assert ours is not None
    assert ours.get('seller', {}).get('email') == SELLER_EMAIL


def test_admin_payments(admin):
    r = admin.get(f"{API}/admin/payments")
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list)
    # Our session should be among transactions
    sids = [t.get('session_id') for t in lst]
    assert STATE.get('session_id') in sids
