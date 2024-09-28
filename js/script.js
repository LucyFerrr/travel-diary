"use strict";

const form = document.querySelector(".form");
const containerTravels = document.querySelector(".travels");
const inputTitle = document.querySelector(".form__input--title");
const inputType = document.querySelector(".form__input--type");
const inputBudget = document.querySelector(".form__input--budget");
const inputDateFrom = document.querySelector(".form__input--date-from");
const inputDateTo = document.querySelector(".form__input--date-to");
const inputDescription = document.querySelector(".form__input--description");
const submitBtn = document.querySelector(".form__btn");
const saveBtn = document.querySelector(".btn--save");
const infoBarContainer = document.querySelector(".infobar");
const infoTitle = document.querySelector(".info__title");
const infoDate = document.querySelector(".info__date");
const infoType = document.querySelector(".info__type");
const infoDescription = document.querySelector(".info__description");
const infoLocation = document.querySelector(".info__location");
const infoBudget = document.querySelector(".info__budget");
const editButton = document.querySelector(".icon--edit");
const trashButton = document.querySelector(".icon--trash");
const infoIcon = document.querySelectorAll(".info__icon");

class Travel {
  id = crypto.randomUUID();
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    this.coords = coords;
    this.title = title;
    this.type = type;
    this.budget = budget;
    this.dateFrom = dateFrom;
    this.dateTo = dateTo;
    this.description = description;
    this.location = location;
    this.marker = marker;
    this.markerDescription = markerDescription;
    this.listDate = listDate;
  }

  _formatDate(dateRange) {
    if (!dateRange) return;
    const [startDate, endDate] = dateRange.map((date) => new Date(date));
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formatDate = new Intl.DateTimeFormat("en-US", options);

    return startDate.toDateString() === endDate.toDateString()
      ? formatDate.format(startDate)
      : `${formatDate.format(startDate)} to ${formatDate.format(endDate)}`;
  }

  _setMarkerDescription() {
    if (!this.dateFrom || !this.dateTo) return;
    // prettier-ignore
    this.markerDescription = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${this._formatDate([this.dateFrom, this.dateTo])}`;
  }

  _setDate() {
    const sameDate = this.dateFrom === this.dateTo;
    this.listDate = sameDate
      ? `${this.dateFrom}`
      : `${this.dateFrom} to ${this.dateTo}`;
  }
}

class Vacation extends Travel {
  type = "vacation";
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    super(
      coords,
      title,
      type,
      budget,
      dateFrom,
      dateTo,
      description,
      location,
      marker,
      markerDescription,
      listDate
    );
    this._setMarkerDescription();
    this._setDate();
  }
}

class Adventure extends Travel {
  type = "adventure";
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    super(
      coords,
      title,
      type,
      budget,
      dateFrom,
      dateTo,
      description,
      location,
      marker,
      markerDescription,
      listDate
    );
    this._setMarkerDescription();
    this._setDate();
  }
}

class RoadTrip extends Travel {
  type = "road-trip";
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    super(
      coords,
      title,
      type,
      budget,
      dateFrom,
      dateTo,
      description,
      location,
      marker,
      markerDescription,
      listDate
    );
    this._setMarkerDescription();
    this._setDate();
  }
}

class BusinessTrip extends Travel {
  type = "business-trip";
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    super(
      coords,
      title,
      type,
      budget,
      dateFrom,
      dateTo,
      description,
      location,
      marker,
      markerDescription,
      listDate
    );
    this._setMarkerDescription();
    this._setDate();
  }
}

class Hiking extends Travel {
  type = "hiking";
  constructor(
    coords,
    title,
    type,
    budget,
    dateFrom,
    dateTo,
    description,
    location,
    marker,
    markerDescription,
    listDate
  ) {
    super(
      coords,
      title,
      type,
      budget,
      dateFrom,
      dateTo,
      description,
      location,
      marker,
      markerDescription,
      listDate
    );
    this._setMarkerDescription();
    this._setDate();
  }
}

class App {
  #map;
  #mapZoomLevel = 13;
  #travels = [];
  #editTravelId;
  #mapEvent;
  #locationCity;
  #locationTown;
  #locationVillage;
  #locationState;
  #fullLocation;
  btnToggle = 0;

  constructor() {
    // Get users position
    this._getPosition();

    this._getLocalStorage();

    form.addEventListener("submit", this._newTravel.bind(this));
    document.addEventListener("keydown", this._onEscapeClose.bind(this));
    submitBtn.addEventListener("click", this._newTravel.bind(this));
    saveBtn.addEventListener("click", this._saveTravel.bind(this));
    containerTravels.addEventListener("click", this._moveToPopUp.bind(this));
    containerTravels.addEventListener("click", this._updateInfo.bind(this));
    containerTravels.addEventListener("click", this._editTravel.bind(this));
    containerTravels.addEventListener("click", this._deleteTravel.bind(this));
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          Swal.fire({
            title: "Couldn't find your location.",
            text: "Please turn on your location",
            icon: "error",
          });
        }
      );
    }
  }

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];

    // Render Map
    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on("click", this._enableForm.bind(this));

    this.#travels.forEach((travel) => {
      this._renderMarker(travel);
    });
  }

  async _getLocationName(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      this.#locationCity = data.address.city || "";
      this.#locationTown = data.address.town || "";
      this.#locationVillage = data.address.village || "";
      this.#locationState = data.address.state || "";
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: `Something went wrong! (${error})`,
      });
    }
  }

  getLocationName() {
    let locationParts = [];

    if (this.#locationCity) {
      locationParts.push(this.#locationCity);
    } else if (this.#locationTown) {
      locationParts.push(this.#locationTown);
    } else if (this.#locationVillage) {
      locationParts.push(this.#locationVillage);
    }

    if (this.#locationState) {
      locationParts.push(this.#locationState);
    }

    this.#fullLocation = locationParts.join(", ");

    return this.#fullLocation.trim();
  }

  async _enableForm(mapE) {
    this.#mapEvent = mapE;
    let lat, lng;

    if (this.#mapEvent.latlng) {
      ({ lat, lng } = this.#mapEvent.latlng);
    } else {
      ({ lat, lng } = mapE);
    }

    form.classList.remove("disabled");
    inputTitle.focus();

    await this._getLocationName(lat, lng);

    return this.getLocationName();
  }

  _disableForm() {
    inputTitle.value =
      inputBudget.value =
      inputDateFrom.value =
      inputDateTo.value =
      inputDescription.value =
        "";

    inputType.value = "vacation";

    form.classList.add("disabled");
  }

  _showSpinner() {
    document.querySelector(".spinner__container").style.display = "flex";
  }

  _hideSpinner() {
    document.querySelector(".spinner__container").style.display = "none";
  }

  async _newTravel(e) {
    e.preventDefault();
    this._showSpinner();
    submitBtn.disabled = true;

    const title = inputTitle.value;
    const type = inputType.value;
    const budget = +inputBudget.value;
    const dateFrom = inputDateFrom.value;
    const dateTo = inputDateTo.value;
    const description = inputDescription.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let travel;

    let location = "Fetching location...";

    const checkEmptyInputs = (...inputs) =>
      inputs.every((input) => Boolean(input));

    const validInputs = function () {
      if (!checkEmptyInputs(title, type, dateFrom, dateTo, description)) {
        Swal.fire({
          title: "Invalid Inputs",
          text: "Make sure the inputs are correct",
          icon: "error",
        });
        this._hideSpinner();
        return false;
      }
      return true;
    }.bind(this);

    try {
      await this._getLocationName(lat, lng);
      const locationName = this.getLocationName();
      location = locationName;
    } catch (error) {
      console.error("Error fetching location:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to fetch the location. Please try again.",
        icon: "error",
      });
    }

    if (!validInputs()) return;

    if (type === "vacation") {
      travel = new Vacation(
        { lat, lng },
        title,
        type,
        budget,
        dateFrom,
        dateTo,
        description,
        location
      );
    }

    if (type === "adventure") {
      travel = new Adventure(
        { lat, lng },
        title,
        type,
        budget,
        dateFrom,
        dateTo,
        description,
        location
      );
    }

    if (type === "road-trip") {
      travel = new RoadTrip(
        { lat, lng },
        title,
        type,
        budget,
        dateFrom,
        dateTo,
        description,
        location
      );
    }

    if (type === "business-trip") {
      travel = new BusinessTrip(
        { lat, lng },
        title,
        type,
        budget,
        dateFrom,
        dateTo,
        description,
        location
      );
    }

    if (type === "hiking") {
      travel = new Hiking(
        { lat, lng },
        title,
        type,
        budget,
        dateFrom,
        dateTo,
        description,
        location
      );
    }

    this.#travels.push(travel);

    this._renderMarker(travel);

    this._renderTravelList(travel);

    this._setLocalStorage();

    this._disableForm();

    this._hideSpinner();
    submitBtn.disabled = false;
  }

  _renderMarker(travel) {
    if (travel.marker) {
      travel.marker.remove();
    }

    const mark = L.marker(travel.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 550,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${travel.type}-popup`,
        })
      )
      .setPopupContent(
        `${
          travel.type === "vacation"
            ? "🏝️"
            : travel.type === "adventure"
            ? "⚔️"
            : travel.type === "road-trip"
            ? "🏍️"
            : travel.type === "business-trip"
            ? "🧑‍💼"
            : "🥾"
        } ${travel.markerDescription}`
      )
      .openPopup();

    travel.marker = mark;
  }

  _renderTravelList(travel) {
    let html = `<li class="travel travel--${travel.type}" data-id="${travel.id}">`;

    if (travel.type === "vacation") {
      html += ` <span class="travel__logo">🏝️</span>
          <div class="travel__content">
            <h2 class="travel__title">${
              travel.title[0].toUpperCase() + travel.title.slice(1)
            }</h2>
            <span class="travel__sub--title">${travel.markerDescription}</span>
          </div>

          <div class="travel__buttons">
            <ion-icon class="travel__icons icon--edit" name="create"></ion-icon>
            <ion-icon class="travel__icons icon--trash" name="trash"></ion-icon>
          </div>
        </li>`;
    }

    if (travel.type === "adventure") {
      html += ` <span class="travel__logo">⚔️</span>
          <div class="travel__content">
            <h2 class="travel__title">${
              travel.title[0].toUpperCase() + travel.title.slice(1)
            }</h2>
            <span class="travel__sub--title">${travel.markerDescription}</span>
          </div>

          <div class="travel__buttons">
            <ion-icon class="travel__icons icon--edit" name="create"></ion-icon>
            <ion-icon class="travel__icons icon--trash" name="trash"></ion-icon>
          </div>
        </li>`;
    }

    if (travel.type === "road-trip") {
      html += ` <span class="travel__logo">🏍️</span>
          <div class="travel__content">
            <h2 class="travel__title">${
              travel.title[0].toUpperCase() + travel.title.slice(1)
            }</h2>
            <span class="travel__sub--title">${travel.markerDescription}</span>
          </div>

          <div class="travel__buttons">
            <ion-icon class="travel__icons icon--edit" name="create"></ion-icon>
            <ion-icon class="travel__icons icon--trash" name="trash"></ion-icon>
          </div>
        </li>`;
    }

    if (travel.type === "business-trip") {
      html += ` <span class="travel__logo">🧑‍💼</span>
          <div class="travel__content">
            <h2 class="travel__title">${
              travel.title[0].toUpperCase() + travel.title.slice(1)
            }</h2>
            <span class="travel__sub--title">${travel.markerDescription}</span>
          </div>

          <div class="travel__buttons">
            <ion-icon class="travel__icons icon--edit" name="create"></ion-icon>
            <ion-icon class="travel__icons icon--trash" name="trash"></ion-icon>
          </div>
        </li>`;
    }

    if (travel.type === "hiking") {
      html += ` <span class="travel__logo">🥾</span>
          <div class="travel__content">
            <h2 class="travel__title">${
              travel.title[0].toUpperCase() + travel.title.slice(1)
            }</h2>
            <span class="travel__sub--title">${travel.markerDescription}</span>
          </div>

          <div class="travel__buttons">
            <ion-icon class="travel__icons icon--edit" name="create"></ion-icon>
            <ion-icon class="travel__icons icon--trash" name="trash"></ion-icon>
          </div>
        </li>`;
    }

    containerTravels.insertAdjacentHTML("afterbegin", html);
  }

  _moveToPopUp(e) {
    const travelEl = e.target.closest(".travel");

    if (!travelEl) return;

    const travel = this.#travels.find(
      (trav) => trav.id === travelEl.dataset.id
    );

    this.#map.setView(travel.coords, this.#mapZoomLevel, {
      animate: true,
      pan: { duration: 1 },
    });
  }

  _clearInfo() {
    infoTitle.textContent =
      infoDate.textContent =
      infoType.textContent =
      infoDescription.textContent =
      infoLocation.textContent =
      infoBudget.textContent =
        " ";
  }

  _clearIcons() {
    infoIcon.forEach((icon) => icon.classList.add("hidden"));
  }

  _addIcons() {
    infoIcon.forEach((icon) => icon.classList.remove("hidden"));
  }

  _updateInfo(e) {
    const travelEl = e.target.closest(".travel");

    if (!travelEl) return;

    const travel = this.#travels.find(
      (trav) => trav.id === travelEl.dataset.id
    );

    this._clearInfo();
    this._addIcons();
    infoTitle.textContent =
      travel.title[0].toUpperCase() + travel.title.slice(1);
    infoDate.textContent = travel.listDate;
    infoType.textContent = travel.type[0].toUpperCase() + travel.type.slice(1);
    infoDescription.textContent =
      travel.description[0].toUpperCase() + travel.description.slice(1);
    infoLocation.textContent = `${travel.location}`;
    infoBudget.textContent = `₱${travel.budget.toFixed(2)}`;
  }

  _setLocalStorage() {
    const travels = this.#travels.map((travel) => {
      const { marker, ...data } = travel;
      return data;
    });

    localStorage.setItem("travels", JSON.stringify(travels));
  }

  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("travels"));
    if (!data) return;

    this.#travels = data;
    this.#travels.forEach((travel) => {
      this._renderTravelList(travel);
    });
  }

  _editTravel(e) {
    this.btnToggle = 1;

    if (!this.btnToggle) return;

    const editButton = e.target.closest(".icon--edit");
    if (!editButton) return;

    const travelEl = e.target.closest(".travel");
    if (!travelEl) return;

    const travel = this.#travels.find(
      (trav) => trav.id === travelEl.dataset.id
    );

    if (!travel) return;

    inputTitle.value = travel.title;
    inputType.value = travel.type;
    inputBudget.value = travel.budget;
    inputDateFrom.value = travel.dateFrom;
    inputDateTo.value = travel.dateTo;
    inputDescription.value = travel.description;

    this.#editTravelId = travelEl.dataset.id;

    this._enableForm(travel.coords);

    saveBtn.classList.remove("disabled");
    submitBtn.classList.add("disabled");

    if (travel.marker) {
      travel.marker.remove();
      travel.marker = null;
    }
  }

  _sanitizeTravelData(travel) {
    const sameDate = travel.dateFrom === travel.dateTo;
    travel.listDate = sameDate
      ? `${travel.dateFrom}`
      : `${travel.dateFrom} to ${travel.dateTo}`;

    travel.markerDescription = `${travel.type[0].toUpperCase()}${travel.type.slice(
      1
    )} on ${this._dateFormat([travel.dateFrom, travel.dateTo])}`;

    return {
      id: travel.id,
      title: travel.title,
      type: travel.type,
      budget: travel.budget,
      dateFrom: travel.dateFrom,
      dateTo: travel.dateTo,
      description: travel.description,
      location: travel.location,
      coords: travel.coords,
      markerDescription: travel.markerDescription,
      listDate: travel.listDate,
    };
  }

  _dateFormat(dateRange) {
    const [start, end] = dateRange;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const sameDate = startDate.toDateString() === endDate.toDateString();
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formatDate = new Intl.DateTimeFormat("en-US", options);

    const formatStartDate = formatDate.format(startDate);
    const formatEndDate = formatDate.format(endDate);
    return sameDate
      ? `${formatStartDate}`
      : `${formatStartDate} - ${formatEndDate}`;
  }

  _saveTravel(e) {
    this.btnToggle = 1;
    if (!this.btnToggle) return;

    e.preventDefault();

    Swal.fire({
      title: "Do you want to save the changes?",
      showDenyButton: true,
      showCancelButton: true,
      confirmButtonText: "Save",
      denyButtonText: `Don't save`,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire("Saved!", "", "success");
        if (this.#editTravelId) {
          const travelIndex = this.#travels.findIndex(
            (trav) => trav.id === this.#editTravelId
          );

          if (travelIndex !== -1) {
            this.#travels[travelIndex] = {
              ...this.#travels[travelIndex],
              title: inputTitle.value,
              type: inputType.value,
              budget: +inputBudget.value,
              dateFrom: inputDateFrom.value,
              dateTo: inputDateTo.value,
              description: inputDescription.value,
            };
          }

          this.#editTravelId = null;
        } else {
          this._newTravel.call(this, e);
        }
        const sanitizedTravels = this.#travels.map(
          this._sanitizeTravelData.bind(this)
        );
        localStorage.setItem("travels", JSON.stringify(sanitizedTravels));
        form.reset();
        form.classList.add("disabled");

        containerTravels.innerHTML = "";
        this.#travels.forEach((travel) => {
          this._renderTravelList(travel);
          this._renderMarker(travel);
        });
        this._clearInfo();
        this._clearIcons();
      } else if (result.isDenied) {
        Swal.fire("Changes are not saved", "", "info");
      }
    });
  }

  _deleteTravel(e) {
    const trashButton = e.target.closest(".icon--trash");
    if (!trashButton) return;

    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      scrollbarPadding: false,
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
          icon: "success",
        });

        const travelEl = e.target.closest(".travel");
        if (!travelEl) return;

        const travelId = travelEl.dataset.id;
        const travelIndex = this.#travels.findIndex(
          (trav) => trav.id === travelId
        );
        if (travelIndex === -1) return;

        this.#travels[travelIndex].marker.remove();
        this.#travels.splice(travelIndex, 1);

        localStorage.setItem(
          "travels",
          JSON.stringify(this.#travels.map(({ marker, ...data }) => data))
        );

        travelEl.remove();
        form.reset();
        form.classList.add("disabled");
        this._clearInfo();
        this._clearIcons();
      }
    });
  }

  _onEscapeClose(e) {
    if (e.key === "Escape") {
      this.btnToggle = 0;
      saveBtn.classList.add("disabled");
      submitBtn.classList.remove("disabled");
      this._clearInfo();
      this._disableForm();
      inputTitle.blur();
      this._clearIcons();
    }
  }
}

const app = new App();
