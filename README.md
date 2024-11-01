# TApp


const data = [
  {
    id: 1,
    primaryFlag: true,
    showCountry: "Ghana",
    nIdTypeName: "VoterId"
  },
  {
    id: 2,
    primaryFlag: false,
    showCountry: "Ghana",
    nIdTypeName: "Driving License"
  }
];

const combinedData = Object.values(
  data.reduce((acc, curr, index) => {
    const countryKey = curr.showCountry;

    // If country entry doesn't exist, create it
    if (!acc[countryKey]) {
      acc[countryKey] = {
        id: index + 1,
        country: curr.showCountry,
        primaryNationalId: "",
        secondaryNationalId: ""
      };
    }

    // Check the primaryFlag to assign to primary or secondary NationalId
    if (curr.primaryFlag) {
      acc[countryKey].primaryNationalId = curr.nIdTypeName;
    } else {
      acc[countryKey].secondaryNationalId = curr.nIdTypeName;
    }

    return acc;
  }, {})
);

console.log(combinedData);


var options = {
    timeZone: 'Brazil/East',
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
} 

new Date().toLocaleString([], options)
------------------------------------------------

https://codepen.io/b3hrooz/pen/ygXbEX			
https://stackblitz.com/edit/angular-fewyhw
https://stackoverflow.com/questions/51892160/expandable-search-bar-in-angular-6

https://bootsnipp.com/snippets/Pb5PX
https://www.solodev.com/blog/web-design/creating-a-toggled-search-bar.stml
https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_anim_search

========================================================================================

https://www.intertech.com/Blog/angular-best-practice-unsubscribing-rxjs-observables/

https://blog.angulartraining.com/rxjs-subjects-a-tutorial-4dcce0e9637f

https://stackoverflow.com/questions/49176474/angular-remove-item-from-behaviorsubjectany

https://medium.com/thecodecampus-knowledge/the-easiest-way-to-unsubscribe-from-observables-in-angular-5abde80a5ae3

https://medium.com/angular-in-depth/the-best-way-to-unsubscribe-rxjs-observable-in-the-angular-applications-d8f9aa42f6a0



eventsList = [];

private eventTracker = new BehaviorSubject<[]>(undefined);

getEvents(): BehaviorSubject<any> {
    this.eventTracker.next(Object.assign(this.eventsList));
    return this.eventTracker;
  }

  setEvent(eventKey, eventValue): void {
    this.eventsList.push({ eventKey: eventValue });
  }



this.auth.getEvents().subscribe(events => {
      events.forEach(event => {
        if (event.hasOwnProperty(key)) { // here the key is the one which is set from the const.events.key
          console.log(event);
           // handle the functionality as per the requirement
        }
      });
    });

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.0.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive/pipe/service/class/module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `-prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
Before running the tests make sure you are serving the app via `ng serve`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
