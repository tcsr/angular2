import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app works!';
  color = 'primary';
  mode = 'determinate';
  value = 50;
  mydate = '08-08-2017';

  myData = [
    {
      "type": "text",
      "label": "First name",
      "order":1,
      "validation": [
        {
          "type": "required"
        },
        {
          "type": "minLength",
          "value": 5,
          "message": "Please enter a name longer then 5 characters"
        },
        {
          "type": "pattern",
          "value": "^[a-zA-Z ]+$",
          "message": "Only letters and spaces are allowed"
        }
      ]
    },
    {
      "type": "text",
      "label": "Last Name",
      "order":2,
      "validation": [
        {
          "type": "required"
        },
        {
          "type": "minLength",
          "value": 5,
          "message": "Please enter a name longer then 5 characters"
        },
        {
          "type": "pattern",
          "value": "^[a-zA-Z ]+$",
          "message": "Only letters and spaces are allowed"
        }
      ]
    },

    {
      "type": "radio",
      "label": "Gender",
      "order":6,
      "value": ["male", "female"],
      "classes": {
        "wrapper": "some-class-for-the-wrapper",
        "label": "label-class",
        "question": [
          "q-class-one",
          "q-class-two"
        ],
        "error": [
          "error-one",
          "error-two"
        ]
      }
    },
    {
      "type": "password",
      "label": "Password",
      "order":4,
      "validation": [
        {
          "type": "required"
        },
        {
          "type": "custom",
          "value": "startsWithNumber",
          "message": "Please dont start with a number"
        }
      ]
    },
    {
      "type": "dropdown",
      "label": "Address",
      "order": 3,
      "options": [
        {
          "value": "osijek",
          "name": "Osijek"
        },
        {
          "value": "zagreb",
          "name": "Zagreb"
        }
      ]
    },
    {
      "type": "radio",
      "label": "Color",
      "value": "Red",
      "order":5,
      "classes": {
        "wrapper": "some-class-for-the-wrapper",
        "label": "label-class",
        "question": [
          "q-class-one",
          "q-class-two"
        ],
        "error": [
          "error-one",
          "error-two"
        ]
      },
      "options": [
        {
          "value": "male",
          "name": "Male"
        },
        {
          "value": "female",
          "name": "Female"
        }
      ]
    },
    {
      "type": "checkbox",
      "label": "Things You Like",
      "order":2,
      "value": [
        "pokemon",
        "starWars"
      ],
      "options": [
        {
          "value": "starWars",
          "name": "Star Wars"
        },
        {
          "value": "batlefield",
          "name": "Batlefield"
        },
        {
          "value": "pokemon",
          "name": "Pokemon"
        }
      ],
      "validation": [
        {
          "type": "required"
        }
      ]
    }
  ];

}
