from selenium import webdriver
from selenium.webdriver.common.by import By
import requests
import os

def scrape_linkedin_profile(profile_url):
    driver = webdriver.Chrome()
    driver.get(profile_url)

    try:
        img_element = driver.find_element(By.CLASS_NAME, 'pv-top-card-profile-picture__image')
        img_url = img_element.get_attribute('src')
        return img_url
    except:
        return None
    finally:
        driver.quit()

def download_image(url, filename, folder="public/assets/founders/photos"):
    if not os.path.exists(folder):
        os.makedirs(folder)

    response = requests.get(url)
    if response.status_code == 200:
        with open(f"{folder}/{filename}", 'wb') as f:
            f.write(response.content)

# Exemple d'utilisation
profiles = {
    "carolina-rossini": "https://www.linkedin.com/in/carolinarossini/",
    "bill-dutton": "https://www.linkedin.com/in/william-dutton-1755772/",
    # ... ajoutez les autres profils
}