# Mind Vault Note Seeker
 Your personal assistant chrome extension for securely storing, organizing, and finding your thoughts, knowledge, and resources, all in one place.

## Installation
your Chrome Extension Application Source files are wraped inside `MindVaultNoteSeeker` folder.\
Copy or UnZip the source folder in your `desired Drive`.\
`BackEnd Server`\
open `command` prompt, change your directory to `DatabaseSQLite` folder inside of `MindVaultNoteSeeker`\
type and run `node server.js` command to start `BackEnd` server. This server remains active all time.\
The server uses Port 3009 for communication.\
`Extension Application`\
Open browser, go to chrome `Manage Extension` option, click on `Load Unpacked` button, choose `MindVaultNoteSeeker` Source folder and load Extension Application.\
Your application is ready to use.

**Important**
Keep the BackEnd server runing all time, when using extension application.


## `Mind Vault Notes Registeration`
Imagine you're browsing your favorite website and come across a brilliant idea or important information.
With Mind Vault Note Seeker, capturing that is as simple as highlighting the text, right-clicking, and selecting the "Mind Vault Note Addition" option.

## Buttons Displayed at Startup
Clicking Mind Valut Note Seeker Extension will be presented with the following options:

`Help`: Opens help content to guide you through the extension's usage.
`Note Seeker - Mind Valut`: Provides an interface Screen to View Notes Collection.

## `Mind Vault Notes Collection View`
Your notes are displayed in a neat grid of four(4) per page.\
Delete Button next to each note, allow you to remove that note from the collection on confirmation.\
A dialog box appears with Notes Information, confirming the Delete Request.\
On Confirmation said Note be deleted from the Collection.\
click any of the Note to visualize the Details.

## `Navigation`
Navigate through your collection effortlessly using the pagination controls at the bottom of screen.\
`First`: Move to the First Page.\
`Previous`: Move to Previous Page.\
`Next`: Move to Next Page.\
`Last`: Move to Last Page.\

## `Mind Vault Notes Detailed View`
The details about any note can easily be seen by clicking on the note you want to visualize.\

A dialog box style window pops up, displaying details about the Note.\
Cross references Notes attached will be displayed as accordions.\
click on any of the accordion, opens the accordion to show respective information.\


## Mind Vault Notes Filters
Want to find something specific? No problem.\
On the left side of the screen, you’ll discover powerful filters Or Search Options by title, abstract, dates, tags, keywords, and even priority. This makes narrowing down your search a breeze.\

Fill out desired filter with your search entry and click "Apply Filters", results Notes listing based on filter options, navigate them, check details.\

## SQLite Database Requirement
Local setup of SQLite's database file is included inside the source file structure, and does not require any database server to set up.\
The Database file is named `MindVaultNoteSeeker.db` and its location is `mindVaultNoteSeeker\DatabaseSQLite\Database".\
 
## SQLite Database Tables
`Notes` are stored inside "MinVaultNotes" table.\
`Tags` are stored inside "NoteTags" table.\
`Keywords` are stored inside "NoteKeywords" table.\

## SQLite Database Maintenance
`Data` in SQLite database in handled within extension application.\
`Tags and Keywords` addition is based on Entry and their existance in the table. On Entry, any non-existing tag or keyword be added in respective tabld. No Deletion.\
`Notes addition` is based on Additional Notes Entry via Capturing screen.\
`Notes Deletion` is accessable via Collecction View screen by clicking on "Delete-Icon" and upon confirmation, respective Note be deleted from Collection.\ 

 
**Important Notes**\
`Tags and Keywords` classifies the Note's content and has similar importance as "Title" that enhance searching.\
`Closing the browser` without saving, in Entry Screen, results in a loss of current additional screen information. Rest of the data remains intact.\
Currently `SQLite database` is set up locally, so it can not be accessed from another laptop or computer.\
`Video` file named "MindVaultNooteSeekerProject" is included for ready reference.
