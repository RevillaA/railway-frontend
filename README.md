# Railway Frontend – Despliegue en AWS

Este repositorio contiene el **frontend en Angular** del sistema.  
El proyecto está configurado para ser empaquetado y servido con **Nginx** dentro de un contenedor Docker.

⚠ **Nota importante:**  
Las APIs de este sistema **no están en este repositorio**. Se encuentran en el repositorio:  
[https://github.com/RevillaA/Proyecto-Apis](https://github.com/RevillaA/Proyecto-Apis)  

En dicho repositorio:  
- Carpeta `products` → API de productos  
- Carpeta `categories` → API de categorías  

**Motivo de la separación de repositorios:**  
Las APIs están en un repositorio independiente porque aunque estas se despliegan en un mismo proyecto de railway si se las separa del repositorio del front estas se pueden gestionar de mejor manera.
Esto permite:  
1. **Despliegues independientes:** Actualizar el backend sin tener que reconstruir el frontend, y viceversa.  
2. **Escalabilidad:** Hospedar las APIs en servidores o servicios diferentes optimizados para backend (Railway, AWS, etc.).  
3. **Mantenimiento y control de versiones:** Facilita la organización del código y la gestión de ramas por cada servicio.  
4. **Seguridad:** Mantener separadas las configuraciones y credenciales sensibles del backend.  

APIs desplegadas actualmente:  
- **Products API:** https://products-api-production-9ae2.up.railway.app/api/products  
- **Categories API:** https://categories-api-production.up.railway.app/api/categories  

---

## 1. Prerrequisitos en el servidor AWS

En tu instancia de AWS (por ejemplo, EC2 con Ubuntu 22.04), asegúrate de tener instalado:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install docker.io docker-compose -y
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 2. Clonar el repositorio

```bash
git clone https://github.com/RevillaA/railway-frontend.git
cd railway-frontend
```

---

## 3. Crear el archivo `docker-compose.yml`

En la raíz del proyecto, crea el archivo `docker-compose.yml` con este contenido:

```yaml
version: "3.8"
services:
  frontend:
    build: .
    container_name: angular_frontend
    ports:
      - "80:80"
    restart: always
```

---

## 4. Construir y levantar el contenedor

```bash
sudo docker compose up -d --build
```

Esto:
- Construirá la imagen usando el `Dockerfile` incluido en el repositorio.
- Servirá el frontend en el puerto **80** para acceso público.

---

## 5. Configurar el firewall y acceso público

En AWS:
1. En el **Security Group** de tu instancia EC2, habilita el puerto **80 (HTTP)** para acceso público.
2. Abre tu navegador y accede a la IP pública de tu instancia:
```
http://<IP_PUBLICA_DE_TU_EC2>
```

---

## 6. Actualizar el frontend

Para actualizar el frontend con cambios recientes:

```bash
git pull origin main
sudo docker compose down
sudo docker compose up -d --build
```

---
