import requests
import json

def test_api():
    url = "http://localhost:8000/verify"
    
    # Teste 1: Apenas texto
    print("Teste 1: Apenas texto")
    try:
        response = requests.post(url, json={"text": "Esta é uma notícia de teste"})
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Sucesso!")
            print(f"Score: {result.get('credibility_score')}")
            print(f"Summary: {result.get('summary', {}).get('status')}")
        else:
            print(f"❌ Erro: {response.text}")
    except Exception as e:
        print(f"❌ Exceção: {e}")
    
    print("-" * 50)
    
    # Teste 2: Apenas URL
    print("Teste 2: Apenas URL")
    try:
        response = requests.post(url, json={"url": "https://g1.globo.com"})
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print("✅ Sucesso!")
            print(f"Score: {result.get('credibility_score')}")
            print(f"Summary: {result.get('summary', {}).get('status')}")
        else:
            print(f"❌ Erro: {response.text}")
    except Exception as e:
        print(f"❌ Exceção: {e}")
    
    print("-" * 50)
    
    # Teste 3: Dados vazios
    print("Teste 3: Dados vazios")
    try:
        response = requests.post(url, json={})
        print(f"Status: {response.status_code}")
        print(f"Resposta: {response.text}")
    except Exception as e:
        print(f"❌ Exceção: {e}")

if __name__ == "__main__":
    test_api()
