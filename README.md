
# 🧠 TalkingChildren

**TalkingChildren** es una aplicación móvil desarrollada con **React Native** y **NativeWind** que permite a niños y niñas interactuar con una interfaz accesible, amigable y personalizable. El enfoque principal es ofrecer una experiencia centrada en la accesibilidad, el aprendizaje y la autonomía.

## 🚀 Características

- 🔐 **Pantalla de inicio de sesión** con opción de autenticación vía Google y Facebook.
- 📝 **Formulario de registro** con validaciones y modo oscuro persistente.
- 🌙 **Soporte para modo claro y oscuro**, gestionado con Zustand y NativeWind.
- 🧠 **Contexto de tema** sincronizado con NativeWind para consistencia visual.
- 📱 **Diseño responsivo** y amigable para dispositivos móviles.
- 💾 **Persistencia de tema** usando AsyncStorage y Zustand middleware.
- ⚙️ **Arquitectura modular** lista para escalar nuevas funciones como juegos, actividades o interacciones por voz.

## 📱 Tecnologías Utilizadas

- React Native
- Expo
- NativeWind
- Zustand
- AsyncStorage
- React Navigation

## 🌗 Persistencia de Tema (Light / Dark)

El estado del tema (claro u oscuro) se gestiona mediante Zustand, y se guarda en el almacenamiento local con AsyncStorage, garantizando que se mantenga después de cerrar o reiniciar la aplicación.

```ts
// Ejemplo de uso
const { theme, toggleTheme } = useThemeStore();
```

## 📂 Estructura de Carpetas

/context
  ThemeContext.tsx        # Contexto para el tema (deprecated si se usa Zustand)
/store
  useThemeStore.ts        # Zustand con persistencia del modo oscuro
/screens
  LoginScreen.tsx
  RegisterScreen.tsx
/navigation
  AppNavigator.tsx        # Stack de navegación
/assets
  ...

## ✨ Capturas

> Puedes agregar imágenes de la app en modo claro y modo oscuro aquí.

## 🛠️ Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/tuusuario/talkingchildren.git
cd talkingchildren
```

git clone https://github.com/Blxckbxll24/talkingchildren.git
cd talkingchildren

2. Instala las dependencias:

```bash
npm install
```


3. Ejecuta la app:

```bash
npx expo start
```





## 👨‍👩‍👧 Público Objetivo

Esta app está pensada especialmente para niños con necesidades educativas especiales, trastornos del lenguaje o que están en procesos iniciales de alfabetización.


