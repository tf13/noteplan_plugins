# What's Changed in 🔎 Search Extensions plugin?
(And see the full [README](https://github.com/NotePlan/plugins/tree/main/jgclark.SearchExtensions).)
<!-- 
- searches now run over Weekly Notes as well (now the underlying API has been extended)
- ??? sort ordering?
-->
## [0.2.0] - 2022-07-05
### Added
- the order of results can now be set: by title, created date, or changed date of the note the result is found in. This can be changed in the Settings.

## [0.1.2] - 2022-07-05
### Fixed
- fixed problem with /saveSearchOverNotes command

## [0.1.1] - 2022-07-03
Mostly to help track down apparent inconsistency in the API.
### Added
- added /saveSearchOverNotes command
- added /saveSearchOverCalendar command

## [0.1.0] - 2022-07-02
First release, with commands from earlier Summaries plugin.
### Changes
- speeded up the **/saveSearchResults** **/saveSearchResultsInPeriod** commands significantly. (Under the hood the plugin now uses an API that takes advantage of caching.)
- now trims the display of matching results in search output, but still highlights the matched terms