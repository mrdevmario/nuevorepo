// Training page calendar picker
"use strict";
const calendarPicker = document.querySelector(".select__location .calendar__picker");

$(".training__calendar").flatpickr({
  dateFormat: "Y-m-d",
  mode: "single",
  defaultDate: "2024-01-08",
  disable: [
    {
      from: "2024-01-01",
      to: "2024-01-07",
    },

    {
      from: "2024-01-09",
      to: "2024-01-17",
    },

    {
      from: "2024-01-19",
      to: "2024-01-21",
    },

    {
      from: "2024-01-23",
      to: "2024-01-26",
    },

    {
      from: "2024-01-28",
      to: "2024-01-31",
    },
  ],
  onChange: function (selectedDate) {
    console.log(selectedDate);
    document.querySelector(".fireguard__session .overlay").style.display = "block";
    document.body.style.overflow = "hidden";

    document.querySelector(".close__btn").addEventListener("click", () => {
      document.querySelector(".fireguard__session .overlay").style.display = "none";
      document.body.style.overflow = "auto";
    });

    document.body.addEventListener("click", (event) => {
      if (!document.querySelector(".training__form ").contains(event.target) && event.target !== document.querySelector(".training__form ")) {
        document.querySelector(".fireguard__session .overlay").style.display = "none";
        document.body.style.overflow = "auto";
      }
    });
  },
  plugins: [
    ShortcutButtonsPlugin({
      button: [
        {
          label: "Cancel",
        },

        {
          label: "Choose Date",
        },

        {
          label: "Available dates",
        },

        {
          label: "Selected date",
        },
      ],
      onClick: (index, fp) => {
        if (index === 0) {
          fp.clear();
          fp.close();
          document.querySelector(".fireguard__session .overlay").style.display = "none";
          document.body.style.overflow = "auto";
        } else if (index === 1) {
          console.log("clicked!");
        }
      },
    }),
  ],
});

if (window.location.pathname === "/account/register") {
  window.location.href = "/account/login";
}

const detailsElements = document.querySelectorAll("details.facets__disclosure-vertical");
detailsElements.forEach((d) => {
  const iconPlus = d.querySelector(".icon-plus");
  const iconMinus = d.querySelector(".icon-minus");

  const setInitialState = () => {
    if (d.hasAttribute("open")) {
      iconPlus.style.display = "none";
      iconMinus.style.display = "block";
    } else {
      iconPlus.style.display = "block";
      iconMinus.style.display = "none";
    }
  };

  setInitialState();

  d.addEventListener("click", () => {
    if (d.hasAttribute("open")) {
      iconPlus.style.display = "block";
      iconMinus.style.display = "none";
    } else {
      iconPlus.style.display = "none";
      iconMinus.style.display = "block";
    }
  });
});
