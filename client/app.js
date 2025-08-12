// Global variables
let locations = [];

// Fallback locations in case server is not available
const fallbackLocations = [
    '1st block jayanagar', '1st phase jp nagar', '2nd phase judicial layout',
    '2nd stage nagarbhavi', '5th block hbr layout', '5th phase jp nagar',
    '6th phase jp nagar', '7th phase jp nagar', '8th phase jp nagar',
    '9th phase jp nagar', 'aecs layout', 'abbigere', 'akshaya nagar',
    'ambalipura', 'ambedkar nagar', 'amruthahalli', 'anandapura',
    'ananth nagar', 'anekal', 'anjanapura', 'ardendale', 'arekere',
    'attibele', 'beml layout', 'btm 2nd stage', 'btm layout', 'babusapalaya',
    'badavala nagar', 'bangalore east', 'bangalore north', 'bannerghatta',
    'bannerghatta road', 'basavangudi', 'basaveshwara nagar', 'battarahalli',
    'begur', 'begur road', 'bellandur', 'benson town', 'bharathi nagar',
    'bhoganhalli', 'billekahalli', 'binny pete', 'bisuvanahalli', 'bommanahalli',
    'bommasandra', 'bommasandra industrial area', 'brookefield', 'budigere',
    'cv raman nagar', 'chamrajpet', 'chandapura', 'channasandra', 'chikka tirupathi',
    'chikkabanavar', 'chikkalasandra', 'choodasandra', 'cooke town', 'cox town',
    'cunningham road', 'dasanapura', 'dasarahalli', 'devanahalli', 'devarachikkanahalli',
    'dodda nekkundi', 'doddaballapur', 'doddakallasandra', 'doddathoguru', 'domlur',
    'dommasandra', 'epip zone', 'electronic city', 'electronic city phase ii',
    'electronics city phase 1', 'frazer town', 'gm palaya', 'garudachar palya',
    'giri nagar', 'gollarapalya hosahalli', 'gottigere', 'green glen layout',
    'gubbalala', 'gunjur', 'hal 2nd stage', 'hbr layout', 'hrbr layout',
    'hsr layout', 'haralur road', 'harlur', 'hebbal', 'hebbal kempapura',
    'hegde nagar', 'hennur', 'hennur road', 'hoodi', 'horamavu agara',
    'horamavu banaswadi', 'hormavu', 'hosa road', 'hosakerehalli', 'hoskote',
    'hosur road', 'hulimavu', 'iblur village', 'indira nagar', 'jp nagar',
    'jakkur', 'jalahalli', 'jalahalli east', 'jigani', 'judicial layout',
    'kr puram', 'kadubeesanahalli', 'kadugodi', 'kaggadasapura', 'kaggalipura',
    'kaikondrahalli', 'kalena agrahara', 'kalyan nagar', 'kambipura',
    'kammanahalli', 'kammasandra', 'kanakapura', 'kanakpura road',
    'kannamangala', 'karuna nagar', 'kasavanhalli', 'kasturi nagar',
    'kathriguppe', 'kaval byrasandra', 'kenchenahalli', 'kengeri',
    'kengeri satellite town', 'kereguddadahalli', 'kodichikkanahalli',
    'kodigehaali', 'kodigehalli', 'kodihalli', 'kogilu', 'konanakunte',
    'koramangala', 'kothannur', 'kothanur', 'kudlu', 'kudlu gate',
    'kumaraswami layout', 'kundalahalli', 'lb shastri nagar', 'laggere',
    'lakshminarayana pura', 'lingadheeranahalli', 'magadi road', 'mahadevpura',
    'mahalakshmi layout', 'mallasandra', 'malleshpalya', 'malleshwaram',
    'marathahalli', 'margondanahalli', 'marsur', 'mico layout', 'munnekollal',
    'murugeshpalya', 'mysore road', 'ngr layout', 'nri layout', 'nagarbhavi',
    'nagasandra', 'nagavara', 'nagavarapalya', 'narayanapura', 'neeladri nagar',
    'nehru nagar', 'ombr layout', 'old airport road', 'old madras road',
    'padmanabhanagar', 'pai layout', 'panathur', 'parappana agrahara',
    'pattandur agrahara', 'poorna pragna layout', 'prithvi layout',
    'r.t. nagar', 'rachenahalli', 'raja rajeshwari nagar', 'rajaji nagar',
    'rajiv nagar', 'ramagondanahalli', 'ramamurthy nagar', 'rayasandra',
    'sahakara nagar', 'sanjay nagar', 'saraswathi nagar', 'sarjapur',
    'sarjapur road', 'sarjapura', 'sector 2 hsr layout', 'sector 7 hsr layout',
    'seegehalli', 'shampura', 'shivaji nagar', 'singasandra', 'somasundara palya',
    'sompura', 'sonnenahalli', 'subramanyapura', 'sultan palaya', 'tc palaya',
    'talaghattapura', 'thanisandra', 'thigalarapalya', 'thubarahalli',
    'tindlu', 'tumkur road', 'ulsoor', 'uttarahalli', 'varthur', 'varthur road',
    'vasanthapura', 'vidyaranyapura', 'vijayanagar', 'vishveshwarya layout',
    'vishwapriya layout', 'vittasandra', 'whitefield', 'yelachenahalli',
    'yelahanka', 'yelahanka new town', 'yelenahalli', 'yeshwanthpur'
];

// DOM elements
const locationSelect = document.getElementById('location');
const sqftInput = document.getElementById('sqft');
const bhkSelect = document.getElementById('bhk');
const bathSelect = document.getElementById('bath');
const priceForm = document.getElementById('priceForm');
const predictBtn = document.getElementById('predictBtn');
const btnText = document.querySelector('.btn-text');
const loading = document.querySelector('.loading');
const resultContainer = document.getElementById('result');
const errorContainer = document.getElementById('error');
const priceValue = document.getElementById('priceValue');
const resultLocation = document.getElementById('resultLocation');
const resultSqft = document.getElementById('resultSqft');
const resultBhk = document.getElementById('resultBhk');
const resultBath = document.getElementById('resultBath');

// API base URL - adjust this to match your server
const API_BASE_URL = 'http://127.0.0.1:5000';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadLocations();
    setupEventListeners();
});

// Load locations from the server
async function loadLocations() {
    try {
        const response = await fetch(`${API_BASE_URL}/get_location_names`);
        if (!response.ok) {
            throw new Error('Failed to fetch locations');
        }
        
        const data = await response.json();
        locations = data.locations || [];
        
        if (locations.length === 0) {
            throw new Error('No locations received from server');
        }
        
        populateLocationDropdown();
        console.log('Locations loaded from server:', locations.length);
    } catch (error) {
        console.error('Error loading locations from server:', error);
        console.log('Using fallback locations');
        locations = fallbackLocations;
        populateLocationDropdown();
        showError('Using offline location data. Please start the server for live predictions.');
    }
}

// Populate the location dropdown
function populateLocationDropdown() {
    // Clear existing options except the first one
    locationSelect.innerHTML = '<option value="">Select Location</option>';
    
    // Add locations to dropdown
    locations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = capitalizeWords(location);
        locationSelect.appendChild(option);
    });
}

// Setup event listeners
function setupEventListeners() {
    priceForm.addEventListener('submit', handleFormSubmit);
    
    // Add input validation
    sqftInput.addEventListener('input', validateSqft);
    bhkSelect.addEventListener('change', validateBhkBathRelation);
    bathSelect.addEventListener('change', validateBhkBathRelation);
}

// Handle form submission
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const formData = getFormData();
    
    try {
        setLoadingState(true);
        hideMessages();
        
        const price = await predictPrice(formData);
        displayResult(price, formData);
        
    } catch (error) {
        console.error('Error predicting price:', error);
        showError('Failed to predict price. Please try again.');
    } finally {
        setLoadingState(false);
    }
}

// Get form data
function getFormData() {
    return {
        location: locationSelect.value,
        sqft: parseFloat(sqftInput.value),
        bhk: parseInt(bhkSelect.value),
        bath: parseInt(bathSelect.value)
    };
}

// Validate form
function validateForm() {
    const formData = getFormData();
    
    if (!formData.location) {
        showError('Please select a location.');
        return false;
    }
    
    if (!formData.sqft || formData.sqft < 300) {
        showError('Please enter a valid square footage (minimum 300 sq ft).');
        return false;
    }
    
    if (!formData.bhk) {
        showError('Please select number of BHK.');
        return false;
    }
    
    if (!formData.bath) {
        showError('Please select number of bathrooms.');
        return false;
    }
    
    // Validate sqft per BHK
    if (formData.sqft / formData.bhk < 300) {
        showError('Square footage seems too low for the selected BHK configuration.');
        return false;
    }
    
    // Validate bath vs BHK relationship
    if (formData.bath > formData.bhk + 1) {
        showError('Number of bathrooms seems too high for the selected BHK configuration.');
        return false;
    }
    
    return true;
}

// Predict price using API
async function predictPrice(formData) {
    const response = await fetch(`${API_BASE_URL}/predict_home_price`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });
    
    if (!response.ok) {
        throw new Error('Failed to predict price');
    }
    
    const data = await response.json();
    return data.estimated_price;
}

// Display result
function displayResult(price, formData) {
    priceValue.textContent = price.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    
    resultLocation.textContent = capitalizeWords(formData.location);
    resultSqft.textContent = formData.sqft.toLocaleString();
    resultBhk.textContent = formData.bhk;
    resultBath.textContent = formData.bath;
    
    resultContainer.style.display = 'block';
    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Show error message
function showError(message) {
    errorContainer.querySelector('p').textContent = message;
    errorContainer.style.display = 'block';
    errorContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Hide messages
function hideMessages() {
    resultContainer.style.display = 'none';
    errorContainer.style.display = 'none';
}

// Set loading state
function setLoadingState(isLoading) {
    predictBtn.disabled = isLoading;
    
    if (isLoading) {
        btnText.style.display = 'none';
        loading.style.display = 'inline';
    } else {
        btnText.style.display = 'inline';
        loading.style.display = 'none';
    }
}

// Validate square footage
function validateSqft() {
    const sqft = parseFloat(sqftInput.value);
    const bhk = parseInt(bhkSelect.value);
    
    if (sqft && bhk && sqft / bhk < 300) {
        sqftInput.setCustomValidity('Square footage seems too low for the selected BHK');
    } else {
        sqftInput.setCustomValidity('');
    }
}

// Validate BHK and Bath relationship
function validateBhkBathRelation() {
    const bhk = parseInt(bhkSelect.value);
    const bath = parseInt(bathSelect.value);
    
    if (bhk && bath && bath > bhk + 1) {
        bathSelect.setCustomValidity('Too many bathrooms for the selected BHK');
    } else {
        bathSelect.setCustomValidity('');
    }
    
    // Also validate sqft if it's filled
    if (sqftInput.value) {
        validateSqft();
    }
}

// Utility function to capitalize words
function capitalizeWords(str) {
    return str.replace(/\b\w/g, char => char.toUpperCase());
}

// Handle API errors gracefully
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    showError('An unexpected error occurred. Please try again.');
});

// Add some interactive features
document.addEventListener('DOMContentLoaded', function() {
    // Add animation class to form elements when they come into view
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animation = 'fadeIn 0.6s ease-out';
            }
        });
    }, observerOptions);
    
    // Observe form elements
    document.querySelectorAll('.form-group, .predict-btn').forEach(el => {
        observer.observe(el);
    });
});
