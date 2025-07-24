# API de Usuarios - Documentación para Frontend

## Información General

**Base URL**: `http://localhost:3000/api/users` (ajustar según tu configuración)

**Autenticación**: Bearer Token requerido en el header `Authorization`

**Content-Type**: `application/json`

## Endpoints Disponibles

### 1. Obtener Todos los Usuarios

**GET** `/api/users`

Obtiene una lista de todos los usuarios registrados en el sistema.

#### Request

```javascript
// Headers requeridos
{
  "Authorization": "Bearer <tu_token>",
  "Content-Type": "application/json"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": 1,
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role_id": 2,
      "created_at": "2025-01-20T10:30:00.000Z",
      "updated_at": "2025-01-20T10:30:00.000Z"
    },
    {
      "id": 2,
      "name": "María García",
      "email": "maria@example.com",
      "role_id": 3,
      "created_at": "2025-01-20T11:15:00.000Z",
      "updated_at": "2025-01-20T11:15:00.000Z"
    }
  ]
}
```

#### Ejemplo JavaScript/TypeScript

```javascript
const getUsers = async () => {
  try {
    const response = await fetch("/api/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log("Usuarios:", data.data);
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    throw error;
  }
};
```

---

### 2. Obtener Usuario por ID

**GET** `/api/users/{id}`

Obtiene un usuario específico por su ID.

#### Request

```javascript
// URL: /api/users/1
// Headers requeridos
{
  "Authorization": "Bearer <tu_token>",
  "Content-Type": "application/json"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role_id": 2,
    "created_at": "2025-01-20T10:30:00.000Z",
    "updated_at": "2025-01-20T10:30:00.000Z"
  }
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

#### Ejemplo JavaScript/TypeScript

```javascript
const getUserById = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(`Error obteniendo usuario ${userId}:`, error);
    throw error;
  }
};
```

---

### 3. Crear Nuevo Usuario

**POST** `/api/users`

Crea un nuevo usuario en el sistema.

#### Request Body

```json
{
  "name": "María García",
  "email": "maria@example.com",
  "password": "password123",
  "role_id": 3
}
```

#### Validaciones

- **name**: Requerido, mínimo 2 caracteres, máximo 100 caracteres
- **email**: Requerido, formato de email válido, único en el sistema
- **password**: Requerido, mínimo 6 caracteres, máximo 255 caracteres
- **role_id**: Requerido, número entero positivo (1=admin, 2=tutor, 3=niño)

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": 3,
    "name": "María García",
    "email": "maria@example.com",
    "role_id": 3,
    "created_at": "2025-01-20T12:00:00.000Z",
    "updated_at": "2025-01-20T12:00:00.000Z"
  }
}
```

#### Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Error de validación",
  "details": "El nombre debe tener al menos 2 caracteres"
}
```

#### Ejemplo JavaScript/TypeScript

```javascript
const createUser = async (userData) => {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Usuario creado:", data.data);
      return data.data;
    } else {
      throw new Error(data.details || data.message);
    }
  } catch (error) {
    console.error("Error creando usuario:", error);
    throw error;
  }
};

// Ejemplo de uso
const newUser = {
  name: "Carlos López",
  email: "carlos@example.com",
  password: "securepass123",
  role_id: 2,
};

createUser(newUser);
```

---

### 4. Actualizar Usuario

**PUT** `/api/users/{id}`

Actualiza la información de un usuario existente.

#### Request Body (todos los campos son opcionales)

```json
{
  "name": "María García López",
  "email": "maria.garcia@example.com",
  "password": "newpassword123",
  "role_id": 2
}
```

#### Validaciones

- **name**: Opcional, mínimo 2 caracteres, máximo 100 caracteres
- **email**: Opcional, formato de email válido, único en el sistema
- **password**: Opcional, mínimo 6 caracteres, máximo 255 caracteres
- **role_id**: Opcional, número entero positivo

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Usuario actualizado exitosamente",
  "data": {
    "id": 3,
    "name": "María García López",
    "email": "maria.garcia@example.com",
    "role_id": 2,
    "created_at": "2025-01-20T12:00:00.000Z",
    "updated_at": "2025-01-20T13:30:00.000Z"
  }
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

#### Ejemplo JavaScript/TypeScript

```javascript
const updateUser = async (userId, updateData) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (data.success) {
      console.log("Usuario actualizado:", data.data);
      return data.data;
    } else {
      throw new Error(data.details || data.message);
    }
  } catch (error) {
    console.error(`Error actualizando usuario ${userId}:`, error);
    throw error;
  }
};

// Ejemplo de uso - actualizar solo el nombre
const updateData = {
  name: "Nuevo Nombre",
};

updateUser(3, updateData);
```

---

### 5. Eliminar Usuario

**DELETE** `/api/users/{id}`

Elimina permanentemente un usuario del sistema.

#### Request

```javascript
// URL: /api/users/3
// Headers requeridos
{
  "Authorization": "Bearer <tu_token>",
  "Content-Type": "application/json"
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente"
}
```

#### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Usuario no encontrado"
}
```

#### Ejemplo JavaScript/TypeScript

```javascript
const deleteUser = async (userId) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      console.log("Usuario eliminado exitosamente");
      return true;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error(`Error eliminando usuario ${userId}:`, error);
    throw error;
  }
};
```

---

## Códigos de Estado HTTP

| Código | Descripción                                        |
| ------ | -------------------------------------------------- |
| 200    | OK - Operación exitosa                             |
| 201    | Created - Usuario creado exitosamente              |
| 400    | Bad Request - Error de validación                  |
| 401    | Unauthorized - Token no válido o faltante          |
| 403    | Forbidden - Sin permisos suficientes               |
| 404    | Not Found - Usuario no encontrado                  |
| 500    | Internal Server Error - Error interno del servidor |

---

## Roles de Usuario

| ID  | Nombre        | Descripción                                                     |
| --- | ------------- | --------------------------------------------------------------- |
| 1   | administrador | Acceso completo al sistema, gestión de usuarios y configuración |
| 2   | tutor         | Puede gestionar niños, crear mensajes y categorías              |
| 3   | niño          | Puede escuchar mensajes asignados y reproducir audios           |

---

## Ejemplo de Clase de Servicio para Frontend

```javascript
class UserService {
  constructor(baseURL, token) {
    this.baseURL = baseURL;
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  async request(url, options = {}) {
    const config = {
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${url}`, config);
    const data = await response.json();

    if (!data.success && response.status >= 400) {
      throw new Error(data.details || data.message || "Error en la petición");
    }

    return data;
  }

  async getAll() {
    const response = await this.request("/users");
    return response.data;
  }

  async getById(id) {
    const response = await this.request(`/users/${id}`);
    return response.data;
  }

  async create(userData) {
    const response = await this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    return response.data;
  }

  async update(id, updateData) {
    const response = await this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });
    return response.data;
  }

  async delete(id) {
    const response = await this.request(`/users/${id}`, {
      method: "DELETE",
    });
    return response.success;
  }
}

// Uso
const userService = new UserService(
  "http://localhost:3000/api",
  "tu_token_aqui"
);

// Obtener todos los usuarios
const users = await userService.getAll();

// Crear usuario
const newUser = await userService.create({
  name: "Test User",
  email: "test@example.com",
  password: "password123",
  role_id: 3,
});
```

---

## Ejemplo con React Hook

```javascript
import { useState, useEffect } from "react";

const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const userService = new UserService(
    "http://localhost:3000/api",
    localStorage.getItem("token")
  );

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const userData = await userService.getAll();
      setUsers(userData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const newUser = await userService.create(userData);
      setUsers((prev) => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const updatedUser = await userService.update(id, updateData);
      setUsers((prev) =>
        prev.map((user) => (user.id === id ? updatedUser : user))
      );
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setLoading(true);
    setError(null);
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  };
};

export default useUsers;
```

---

## Notas Importantes

1. **Seguridad**: Las contraseñas nunca se devuelven en las respuestas de la API.

2. **Validación de Email**: Al crear o actualizar usuarios, el sistema verifica que el email no esté ya registrado.

3. **Autenticación**: Todos los endpoints requieren un token Bearer válido.

4. **Permisos**: Dependiendo del rol del usuario autenticado, pueden existir restricciones adicionales (implementar según la lógica de negocio).

5. **Manejo de Errores**: Siempre verificar el campo `success` en la respuesta antes de procesar los datos.

6. **Formato de Fechas**: Las fechas se devuelven en formato ISO 8601 UTC.

Esta documentación te permite implementar todas las operaciones CRUD de usuarios en tu frontend de manera consistente con la API del backend.
