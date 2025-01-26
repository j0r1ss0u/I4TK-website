from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import os
import requests
from PIL import Image
from io import BytesIO

class LinkedInScraper:
    def __init__(self):
        options = Options()
        options.add_argument('--no-sandbox')
        options.add_argument('--headless')
        options.add_argument('--disable-dev-shm-usage')
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def login(self, email, password):
        print("Logging in...")
        self.driver.get('https://www.linkedin.com/login')
        time.sleep(2)

        email_field = self.wait.until(EC.presence_of_element_located((By.ID, 'username')))
        email_field.send_keys(email)

        password_field = self.driver.find_element(By.ID, 'password')
        password_field.send_keys(password)

        self.driver.find_element(By.CSS_SELECTOR, '[type="submit"]').click()
        time.sleep(5)
        print("Login successful")

    def get_profile_photo(self, profile_url):
        print(f"Fetching: {profile_url}")
        self.driver.get(profile_url)
        time.sleep(3)

        try:
            photo = self.wait.until(EC.presence_of_element_located(
                (By.CSS_SELECTOR, '.pv-top-card-profile-picture__image')
            ))
            return photo.get_attribute('src')
        except Exception as e:
            print(f"Error fetching photo: {str(e)}")
            return None

    def download_and_process_image(self, url, filepath):
        try:
            response = requests.get(url)
            if response.status_code == 200:
                img = Image.open(BytesIO(response.content))
                img = img.convert('RGB')
                img.save(filepath, 'JPEG', quality=95)
                print(f"Saved: {filepath}")
                return True
        except Exception as e:
            print(f"Error saving image: {str(e)}")
        return False

    def close(self):
        self.driver.quit()

def main():
    founders_data = {
        "Carolina A. ROSSINI": {"linkedin": "carolinarossini", "id": "carolina-rossini"},
        "Bill DUTTON": {"linkedin": "william-dutton-1755772", "id": "bill-dutton"},
        "Elizaveta CHERNENKO": {"linkedin": "elizaveta-chernenko", "id": "elizaveta-chernenko"},
        "Alison GILLWALD": {"linkedin": "alison-gillwald-6183b114", "id": "alison-gillwald"},
        "Liz OREMBO": {"linkedin": "lizorembo", "id": "liz-orembo"},
        "Bruce GIRARD": {"linkedin": "brucegirard", "id": "bruce-girard"},
        "Gustavo GÓMEZ": {"linkedin": "gusgomez", "id": "gustavo-gomez"},
        "Merrin Mohammed ASHRAF": {"linkedin": "merrin-ashraf", "id": "merrin-ashraf"},
        "Anita GURUMURTHY": {"linkedin": "anita-gurumurthy", "id": "anita-gurumurthy"},
        "Serena CIRANNA": {"linkedin": "serenaciranna", "id": "serena-ciranna"},
        "Daniel ANDLER": {"linkedin": "daniel-andler", "id": "daniel-andler"},
        "Seerat KHAN": {"linkedin": "seeratkhan", "id": "seerat-khan"},
        "Nighat DAD": {"linkedin": "nighatdad", "id": "nighat-dad"},
        "Ian BARBER": {"linkedin": "ianbarber", "id": "ian-barber"},
        "Maria Paz CANALES": {"linkedin": "mariapazcanales", "id": "maria-paz-canales"},
        "Iná JOST": {"linkedin": "inajost", "id": "ina-jost"},
        "Fernanda K. MARTINS": {"linkedin": "fernandakmartins", "id": "fernanda-martins"},
        "Christophe GAUTHIER": {"linkedin": "christophegauthier", "id": "christophe-gauthier"},
        "Mathias DUFOUR": {"linkedin": "mathiasdufour", "id": "mathias-dufour"},
        "Jeremy SHTERN": {"linkedin": "jeremy-shtern", "id": "jeremy-shtern"},
        "Frits BUSSEMAKER": {"linkedin": "fritsbussemaker", "id": "frits-bussemaker"},
        "Jon STEVER": {"linkedin": "jonstever", "id": "jon-stever"},
        "Arnya HAMILTON": {"linkedin": "arnyahamilton", "id": "arnya-hamilton"},
        "Nubert BOUBEKA": {"linkedin": "nubertboubeka", "id": "nubert-boubeka"},
        "Ingrid VOLKMER": {"linkedin": "ingridvolkmer", "id": "ingrid-volkmer"},
        "Ramon TUAZON": {"linkedin": "ramontuazon", "id": "ramon-tuazon"},
        "Amrita SENGUPTA": {"linkedin": "amritasengupta", "id": "amrita-sengupta"},
        "Armando GUIO": {"linkedin": "armandoguio", "id": "armando-guio"},
        "Roger LATCHMAN": {"linkedin": "rogerlatchman", "id": "roger-latchman"}
    }

    OUTPUT_DIR = "public/assets/founders/photos"
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    EMAIL = input("Enter LinkedIn email: ")
    PASSWORD = input("Enter LinkedIn password: ")

    scraper = LinkedInScraper()

    try:
        scraper.login(EMAIL, PASSWORD)
        time.sleep(3)

        for name, data in founders_data.items():
            profile_url = f"https://www.linkedin.com/in/{data['linkedin']}/"
            photo_url = scraper.get_profile_photo(profile_url)

            if photo_url:
                filepath = os.path.join(OUTPUT_DIR, f"{data['id']}.jpg")
                scraper.download_and_process_image(photo_url, filepath)

            time.sleep(2)

    except Exception as e:
        print(f"Error: {str(e)}")
    finally:
        scraper.close()

if __name__ == "__main__":
    main()