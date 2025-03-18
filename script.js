const apiKey = '33ef93c22acde39660bb5a4b35deecc2';
const cityInput = document.getElementById('city');

// Thêm sự kiện lắng nghe cho ô nhập liệu
cityInput.addEventListener('keydown', (event) => {
    // Nếu người dùng nhấn phím Enter
    if (event.key === 'Enter') {
        event.preventDefault(); // Ngăn chặn hành động mặc định
        getWeather(); // Gọi hàm để lấy thông tin thời tiết
    }
});

function getWeather() {
    const city = cityInput.value; // Lấy giá trị từ ô nhập liệu
    if (!city) {
        alert('Please enter a city'); // Hiển thị cảnh báo nếu không có thành phố
        return; // Kết thúc hàm
    }

    // Tạo URL để gọi API cho thời tiết hiện tại và dự báo
    const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    showLoading(); // Hiển thị trạng thái tải

    // Gọi cả hai API đồng thời
    Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)])
        .then(responses => {
            // Kiểm tra xem cả hai yêu cầu có thành công không
            if (!responses[0].ok || !responses[1].ok) {
                throw new Error('Error fetching weather data'); // Ném lỗi nếu có lỗi
            }
            // Chuyển đổi phản hồi thành JSON
            return Promise.all(responses.map(res => res.json()));
        })
        .then(([currentData, forecastData]) => {
            // Hiển thị thông tin thời tiết và dự báo
            displayWeather(currentData);
            displayHourlyForecast(forecastData.list);
            hideLoading(); // Ẩn trạng thái tải
        })
        .catch(error => {
            console.error('Error:', error); // In lỗi ra console
            alert(`Error: ${error.message}. Please try again.`); // Hiển thị thông báo lỗi
            hideLoading(); // Ẩn trạng thái tải
        });
}

// Hàm chuyển đổi chữ cái đầu tiên của mỗi từ thành chữ hoa
function capitalizeFirstLetter(string) {
    return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Hàm hiển thị thông tin thời tiết
function displayWeather(data) {
    const tempDivInfo = document.getElementById('temp-div'); // Phần tử hiển thị nhiệt độ
    const weatherInfoDiv = document.getElementById('weather-info'); // Phần tử hiển thị thông tin thời tiết
    const weatherIcon = document.getElementById('weather-icon'); // Phần tử hiển thị biểu tượng thời tiết
    const dateDiv = document.getElementById('date-div'); // Phần tử hiển thị ngày
    const body = document.body; // Lấy phần tử body

    // Xóa nội dung trước đó
    tempDivInfo.innerHTML = '';
    weatherInfoDiv.innerHTML = '';
    dateDiv.innerHTML = '';

    // Kiểm tra mã phản hồi
    if (data.cod === '404') {
        weatherInfoDiv.innerHTML = `<p>City not found. Please try again.</p>`; // Hiển thị thông báo nếu không tìm thấy thành phố
        return;
    }

    const cityName = data.name; // Tên thành phố
    const temperature = Math.round(data.main.temp - 273.15); // Chuyển đổi nhiệt độ từ Kelvin sang Celsius
    const description = capitalizeFirstLetter(data.weather[0].description); // Mô tả thời tiết
    const iconCode = data.weather[0].icon; // Mã biểu tượng thời tiết
    const iconUrl = `https://openweathermap.org/img/wn/${iconCode}@4x.png`; // URL biểu tượng thời tiết

    cityInput.value = cityName; // Cập nhật ô nhập liệu với tên thành phố

    const currentDate = new Date(); // Lấy ngày hiện tại
    const options = { year: 'numeric', month: 'long', day: 'numeric' }; // Định dạng ngày
    const formattedDate = currentDate.toLocaleDateString('en-US', options); // Chuyển đổi ngày sang định dạng

    // Cập nhật nội dung HTML với thông tin thời tiết
    tempDivInfo.innerHTML = `<p>${temperature}°C</p>`;
    weatherInfoDiv.innerHTML = `
        <p>${cityName}</p>
        <p>${description}</p>
        <div class="weather-details">
            <div class="weather-info">
                <i class="fas fa-water"></i> ${data.main.humidity}% <span>Humidity</span>
            </div>
            <div class="weather-info">
                <i class="fas fa-wind"></i> ${Math.round(data.wind.speed * 3.6)} km/h <span>Wind Speed</span>
            </div>
        </div>
    `;
    weatherIcon.src = iconUrl; // Cập nhật biểu tượng thời tiết
    weatherIcon.alt = description; // Cập nhật mô tả cho biểu tượng
    dateDiv.innerHTML = `<p>${formattedDate}</p>`; // Hiển thị ngày

    // Cập nhật lớp của body để áp dụng hiệu ứng
    body.className = '';
    body.classList.add(data.weather[0].main.toLowerCase());
    showImage(); // Hiển thị biểu tượng thời tiết
}

// Hàm hiển thị dự báo thời tiết theo giờ
function displayHourlyForecast(hourlyData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast'); // Phần tử hiển thị dự báo theo giờ
    hourlyForecastDiv.innerHTML = ''; // Xóa nội dung trước đó

    // Lặp qua dữ liệu dự báo và hiển thị
    hourlyData.slice(0, 8).forEach(item => {
        const dateTime = new Date(item.dt * 1000); // Chuyển đổi thời gian Unix sang định dạng ngày
        const hour = dateTime.getHours(); // Lấy giờ
        const temperature = Math.round(item.main.temp - 273.15); // Chuyển đổi nhiệt độ
        const iconCode = item.weather[0].icon; // Mã biểu tượng thời tiết
        const iconUrl = `https://openweathermap.org/img/wn/${iconCode}.png`; // URL biểu tượng thời tiết

        // Cập nhật nội dung HTML với thông tin dự báo theo giờ
        hourlyForecastDiv.innerHTML += `
            <div class="hourly-item">
                <span>${hour}:00</span>
                <img src="${iconUrl}" alt="Hourly Weather Icon">
                <span>${temperature}°C</span>
            </div>
        `;
    });
}

// Hàm hiển thị biểu tượng thời tiết
function showImage() {
    const weatherIcon = document.getElementById('weather-icon'); // Lấy phần tử biểu tượng thời tiết
    weatherIcon.style.display = 'block'; // Hiển thị biểu tượng
    weatherIcon.classList.add('show', 'animated'); // Thêm hiệu ứng
}

// Hàm hiển thị trạng thái tải
function showLoading() {
    document.getElementById('loading').style.display = 'flex'; // Hiển thị phần tử trạng thái tải
}

// Hàm ẩn trạng thái tải
function hideLoading() {
    document.getElementById('loading').style.display = 'none'; // Ẩn phần tử trạng thái tải
}

// Hàm thiết lập tính năng tự động hoàn thành cho ô nhập liệu
function setupAutocomplete() {
    const cities = ['New York', 'London', 'Paris', 'Tokyo', 'Berlin']; // Danh sách thành phố
    const cityInput = document.getElementById('city'); // Lấy phần tử ô nhập liệu

    // Thêm sự kiện lắng nghe cho ô nhập liệu
    cityInput.addEventListener('input', () => {
        const inputText = cityInput.value.toLowerCase(); // Lấy giá trị nhập vào
        const filteredCities = cities.filter(city => city.toLowerCase().startsWith(inputText)); // Lọc thành phố

        const datalist = document.getElementById('city-list'); // Lấy phần tử danh sách
        datalist.innerHTML = ''; // Xóa nội dung trước đó

        // Thêm các tùy chọn vào danh sách
        filteredCities.forEach(city => {
            const option = document.createElement('option'); // Tạo phần tử option
            option.value = city; // Gán giá trị cho option
            datalist.appendChild(option); // Thêm option vào danh sách
        });
    });
}


// Gọi hàm để thiết lập tính năng autocomplete khi trang được tải
document.addEventListener('DOMContentLoaded', setupAutocomplete);

// Hàm lấy thời tiết theo vị trí người dùng
function getLocationWeather() {
    if (navigator.geolocation) {
        showLoading(); // Hiển thị trạng thái tải

        // Lấy vị trí hiện tại của người dùng
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords; // Lấy tọa độ

                // Tạo URL cho thời tiết hiện tại và dự báo theo vị trí
                const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
                const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

                try {
                    const responses = await Promise.all([fetch(currentWeatherUrl), fetch(forecastUrl)]); // Gọi API
                    if (!responses[0].ok || !responses[1].ok) {
                        throw new Error('Error fetching weather data'); // Ném lỗi nếu có lỗi
                    }
                    const [currentData, forecastData] = await Promise.all(responses.map(res => res.json())); // Chuyển đổi phản hồi thành JSON
                    displayWeather(currentData); // Hiển thị thông tin thời tiết
                    displayHourlyForecast(forecastData.list); // Hiển thị dự báo theo giờ
                    hideLoading(); // Ẩn trạng thái tải
                } catch (error) {
                    console.error('Error:', error); // In lỗi ra console
                    alert(`Error: ${error.message}. Please try again.`); // Hiển thị thông báo lỗi
                    hideLoading(); // Ẩn trạng thái tải
                }
            },
            (error) => {
                console.error('Error getting location:', error); // In lỗi ra console
                alert('Error getting your location. Please make sure location access is enabled.'); // Thông báo lỗi
                hideLoading(); // Ẩn trạng thái tải
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.'); // Thông báo nếu không hỗ trợ Geolocation
    }
}

// Hàm reset về trạng thái ban đầu
function resetToInitialState() {
    cityInput.value = '';
    document.getElementById('temp-div').innerHTML = '';
    document.getElementById('weather-info').innerHTML = '';
    document.getElementById('weather-icon').src = '';
    document.getElementById('weather-icon').style.display = 'none';
    document.getElementById('hourly-forecast').innerHTML = '';
    document.body.className = '';
    document.getElementById('weather-effects').innerHTML = '';

    // Ẩn phần tử ngày và tiêu đề "Hourly Forecast"
    document.getElementById('date-div').innerHTML = ''; // Ẩn ngày
    document.getElementById('hourly-heading').style.display = 'none'; // Ẩn tiêu đề
}

// Thêm sự kiện click vào tiêu đề
document.getElementById('refresh-title').addEventListener('click', resetToInitialState);

// Hiệu ứng thời tiết
// function showWeatherEffect(weatherMain) {
//     const weatherEffects = document.getElementById('weather-effects');
//     weatherEffects.innerHTML = '';

//     if (weatherMain === 'Rain') {
//         createWeatherEffect('rain', weatherEffects);
//     } else if (weatherMain === 'Snow') {
//         createWeatherEffect('snow', weatherEffects);
//     } else if (weatherMain === 'Thunderstorm') {
//         createWeatherEffect('thunderstorm', weatherEffects);
//     }
// }

// function createWeatherEffect(type, container) {
//     const effectDiv = document.createElement('div');
//     effectDiv.classList.add(type);
//     const count = type === 'rain' ? 100 : 50; // Số lượng giọt mưa hoặc bông tuyết

//     for (let i = 0; i < count; i++) {
//         const element = document.createElement('div');
//         element.classList.add(type === 'rain' ? 'drop' : 'snowflake');
//         element.style.left = Math.random() * 100 + 'vw';
//         element.style.animationDuration = (Math.random() * (type === 'rain' ? 1 : 3) + (type === 'rain' ? 0.5 : 2)) + 's';
//         effectDiv.appendChild(element);
//     }
//     container.appendChild(effectDiv);
// }