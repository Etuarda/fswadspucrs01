/**
 * MiniMercado Bom Preço - Sistema de Gerenciamento
 * 
 * Módulos:
 * 1. Formulário de Cadastro
 * 2. Gerenciamento de Carrinho
 * 3. Utilitários de Interface
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializa todos os módulos
    initApplication();
});

/**
 * Módulo Principal - Coordena a inicialização de todos os módulos
 */
const initApplication = () => {
    try {
        initFormModule();
        initCartModule();
        initUIModule();
    } catch (error) {
        console.error('Erro na inicialização da aplicação:', error);
    }
};

/**
 * 1. Módulo de Formulário - Gerencia o formulário de cadastro
 */
const initFormModule = () => {
    const form = document.getElementById('formCadastro');
    if (!form) return;

    const deliverySection = document.getElementById('dadosEntrega');
    const deliveryOptions = document.querySelectorAll('input[name="entrega"]');

    // Configura visibilidade inicial
    toggleDeliverySection(deliverySection, false);

    // Adiciona listeners
    deliveryOptions.forEach(option => {
        option.addEventListener('change', () =>
            handleDeliveryOptionChange(option.value, deliverySection));
    });

    form.addEventListener('submit', handleFormSubmit);
    initLiveValidation();
};

const toggleDeliverySection = (section, show) => {
    if (!section) return;
    section.style.display = show ? 'block' : 'none';
    if (show) {
        section.classList.add('animate__animated', 'animate__fadeIn');
    }
};

const handleDeliveryOptionChange = (optionValue, deliverySection) => {
    toggleDeliverySection(deliverySection, optionValue === 'entrega');
};

const handleFormSubmit = (event) => {
    event.preventDefault();

    if (validateForm()) {
        showSuccessMessage();
        // form.submit(); // Descomente para envio real
    }
};

const validateForm = () => {
    const formFields = {
        nome: { value: document.getElementById('nome').value, minLength: 3 },
        email: { value: document.getElementById('email').value, isEmail: true },
        telefone: { value: document.getElementById('telefone').value, isPhone: true },
        entrega: { value: document.querySelector('input[name="entrega"]:checked')?.value }
    };

    // Validação básica dos campos
    let isValid = validateFields(formFields);

    // Validação adicional para entrega
    if (formFields.entrega.value === 'entrega') {
        isValid = isValid && validateDeliveryFields();
    }

    return isValid;
};

const validateFields = (fields) => {
    let isValid = true;

    for (const [fieldId, field] of Object.entries(fields)) {
        const element = document.getElementById(fieldId);

        if (!element) continue;

        if (field.isRequired && !field.value) {
            markFieldInvalid(element, 'Campo obrigatório');
            isValid = false;
        } else if (field.minLength && field.value.length < field.minLength) {
            markFieldInvalid(element, `Mínimo de ${field.minLength} caracteres`);
            isValid = false;
        } else if (field.isEmail && !isValidEmail(field.value)) {
            markFieldInvalid(element, 'E-mail inválido');
            isValid = false;
        } else if (field.isPhone && !isValidPhone(field.value)) {
            markFieldInvalid(element, 'Telefone inválido');
            isValid = false;
        }
    }

    if (!fields.entrega.value) {
        alert('Por favor, selecione uma forma de recebimento');
        isValid = false;
    }

    return isValid;
};

const validateDeliveryFields = () => {
    const deliveryFields = {
        endereco: { value: document.getElementById('endereco').value, isRequired: true },
        cep: { value: document.getElementById('cep').value, isCEP: true }
    };

    return validateFields(deliveryFields);
};

const markFieldInvalid = (element, message) => {
    element.classList.add('is-invalid');
    const feedback = element.nextElementSibling;
    if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = message;
    }
};

const initLiveValidation = () => {
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', () => {
            input.classList.remove('is-invalid');
        });
    });
};

const showSuccessMessage = () => {
    const formCard = document.querySelector('#cadastro .card');
    if (!formCard) return;

    formCard.innerHTML = `
    <div class="card-body text-center py-5">
      <i class="bi bi-check-circle-fill text-success display-4 mb-3"></i>
      <h3 class="mb-3">Cadastro realizado com sucesso!</h3>
      <p class="mb-0">Em breve entraremos em contato para confirmar seu pedido.</p>
    </div>
  `;
};

/**
 * 2. Módulo de Carrinho - Gerencia a adição de produtos ao carrinho
 */
const initCartModule = () => {
    const cartButtons = document.querySelectorAll('.btn-outline-primary');
    if (!cartButtons.length) return;

    // Inicializa carrinho
    const cart = getCartFromStorage();
    updateCartCounter(cart.length);

    // Configura listeners
    cartButtons.forEach(button => {
        button.addEventListener('click', () => handleAddToCart(button));
    });
};

const getCartFromStorage = () => {
    try {
        return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (error) {
        console.error('Erro ao recuperar carrinho:', error);
        return [];
    }
};

const handleAddToCart = (button) => {
    const productCard = button.closest('.card');
    if (!productCard) return;

    const product = {
        id: productCard.dataset.productId || Date.now().toString(),
        name: productCard.querySelector('.card-title')?.textContent || 'Produto sem nome',
        price: productCard.querySelector('.card-text')?.textContent || 'Preço não disponível',
        image: productCard.querySelector('img')?.src || ''
    };

    addProductToCart(product);
    showAddToCartFeedback(button);
};

const addProductToCart = (product) => {
    const cart = getCartFromStorage();
    const existingItem = cart.find(item => item.id === product.id);

    if (existingItem) {
        existingItem.quantity = (existingItem.quantity || 1) + 1;
    } else {
        product.quantity = 1;
        cart.push(product);
    }

    saveCartToStorage(cart);
    updateCartCounter(cart.length);
};

const saveCartToStorage = (cart) => {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Erro ao salvar carrinho:', error);
    }
};

const updateCartCounter = (count) => {
    let counter = document.getElementById('cart-counter');

    if (!counter) {
        createCartCounter();
        counter = document.getElementById('cart-counter');
    }

    if (counter) {
        counter.textContent = count;
    }
};

const createCartCounter = () => {
    const nav = document.querySelector('.navbar-nav');
    if (!nav) return;

    const cartItem = document.createElement('li');
    cartItem.className = 'nav-item position-relative';
    cartItem.innerHTML = `
    <a class="nav-link" href="#">
      <i class="bi bi-cart"></i>
      <span id="cart-counter" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
        0
      </span>
    </a>
  `;
    nav.appendChild(cartItem);
};

const showAddToCartFeedback = (button) => {
    const originalHTML = button.innerHTML;
    const originalClasses = button.className;

    button.innerHTML = '<i class="bi bi-check"></i> Adicionado';
    button.className = originalClasses.replace('btn-outline-primary', 'btn-success');

    setTimeout(() => {
        button.innerHTML = originalHTML;
        button.className = originalClasses;
    }, 2000);
};

/**
 * 3. Módulo de UI - Gerencia interações gerais da interface
 */
const initUIModule = () => {
    initSmoothScrolling();
    initTooltips();
};

const initSmoothScrolling = () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
};

const initTooltips = () => {
    const tooltipElements = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    if (!tooltipElements.length) return;

    tooltipElements.forEach(el => {
        new bootstrap.Tooltip(el);
    });
};

/**
 * Utilitários - Funções auxiliares reutilizáveis
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

const isValidPhone = (phone) => {
    const phoneRegex = /^\(?\d{2}\)?[\s-]?\d{4,5}[\s-]?\d{4}$/;
    return phoneRegex.test(phone);
};

const isValidCEP = (cep) => {
    const cepRegex = /^\d{5}-?\d{3}$/;
    return cepRegex.test(cep);
};