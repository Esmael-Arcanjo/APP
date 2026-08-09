import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  pt: {
    translation: {
      common: {
        search: 'Buscar',
        cart: 'Carrinho',
        login: 'Entrar',
        register: 'Cadastrar',
        logout: 'Sair',
        save: 'Salvar',
        cancel: 'Cancelar',
        delete: 'Excluir',
        edit: 'Editar',
        view: 'Visualizar',
        back: 'Voltar',
        next: 'Próximo',
        loading: 'Carregando...',
        error: 'Erro',
        success: 'Sucesso',
      },
      home: {
        title: 'Bem-vindo ao WIBAZA',
        subtitle: 'Seu marketplace internacional',
        categories: 'Categorias',
      },
      auth: {
        email: 'E-mail',
        password: 'Senha',
        name: 'Nome',
        loginTitle: 'Entrar',
        registerTitle: 'Cadastrar',
        forgotPassword: 'Esqueceu a senha?',
        dontHaveAccount: 'Não tem conta?',
        alreadyHaveAccount: 'Já tem conta?',
      },
      product: {
        addToCart: 'Adicionar ao Carrinho',
        outOfStock: 'Sem Estoque',
        price: 'Preço',
        description: 'Descrição',
        reviews: 'Avaliações',
      },
    },
  },
  en: {
    translation: {
      common: {
        search: 'Search',
        cart: 'Cart',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        view: 'View',
        back: 'Back',
        next: 'Next',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
      },
      home: {
        title: 'Welcome to WIBAZA',
        subtitle: 'Your international marketplace',
        categories: 'Categories',
      },
      auth: {
        email: 'Email',
        password: 'Password',
        name: 'Name',
        loginTitle: 'Login',
        registerTitle: 'Register',
        forgotPassword: 'Forgot password?',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
      },
      product: {
        addToCart: 'Add to Cart',
        outOfStock: 'Out of Stock',
        price: 'Price',
        description: 'Description',
        reviews: 'Reviews',
      },
    },
  },
  es: {
    translation: {
      common: {
        search: 'Buscar',
        cart: 'Carrito',
        login: 'Entrar',
        register: 'Registrarse',
        logout: 'Salir',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        view: 'Ver',
        back: 'Volver',
        next: 'Siguiente',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
      },
      home: {
        title: 'Bienvenido a WIBAZA',
        subtitle: 'Tu marketplace internacional',
        categories: 'Categorías',
      },
      auth: {
        email: 'Correo electrónico',
        password: 'Contraseña',
        name: 'Nombre',
        loginTitle: 'Entrar',
        registerTitle: 'Registrarse',
        forgotPassword: '¿Olvidaste tu contraseña?',
        dontHaveAccount: '¿No tienes cuenta?',
        alreadyHaveAccount: '¿Ya tienes cuenta?',
      },
      product: {
        addToCart: 'Agregar al Carrito',
        outOfStock: 'Sin Stock',
        price: 'Precio',
        description: 'Descripción',
        reviews: 'Reseñas',
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'pt',
  fallbackLng: 'pt',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
