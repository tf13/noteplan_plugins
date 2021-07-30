var exports = (function (exports) {
  'use strict';

  //-------------------------------------------------------------------------------
  // Input functions
  // (from @nmn / nmn.sweep)
  // (from @nmn / nmn.sweep)
  async function chooseOption$1(title, options, defaultValue) {
    var _options$index$value, _options$index;

    const {
      index
    } = await CommandBar.showOptions(options.map(option => option.label), title);
    return (_options$index$value = (_options$index = options[index]) === null || _options$index === void 0 ? void 0 : _options$index.value) !== null && _options$index$value !== void 0 ? _options$index$value : defaultValue;
  } // (from @nmn / nmn.sweep)
  /**
   * Show a single-button dialog-box like message (modal) using CommandBar
   * @author @dwertheimer, updating @nmn
   * @param {string} message - text to display to user
   * @param {string} confirmTitle - the "button" (option) text (default: 'OK')
   */

  async function showMessage$1(message, confirmTitle = 'OK') {
    await CommandBar.showOptions([confirmTitle], message);
  }
  /**
   * Helper function to show a simple yes/no (could be OK/Cancel, etc.) dialog using CommandBar
   * @param {string} message - text to display to user
   * @param {Array<string>} - an array of the choices to give (default: ['Yes', 'No'])
   * @returns {string} - returns the user's choice - the actual *text* choice from the input array provided
   */

  async function showMessageYesNo(message, choicesArray = ['Yes', 'No']) {
    const answer = await CommandBar.showOptions(choicesArray, message);
    return choicesArray[answer.index];
  }
  // Date functions
  // @jgclark except where shown

  const RE_DATE = '\\d{4}-[01]\\d{1}-\\d{2}'; // find dates of form YYYY-MM-DD

  new Date().toISOString().slice(0, 10); // TODO: make a friendlier string

  new Date().toISOString().slice(0, 16);
  const nowLocaleDateTime = new Date().toLocaleString(); // @nmn

  function getYearMonthDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    const date = dateObj.getDate();
    return {
      year,
      month,
      date
    };
  }
  function toISODateString(dateObj) {
    return dateObj.toISOString().slice(0, 10);
  }
  function hyphenatedDate(dateObj) {
    const {
      year,
      month,
      date
    } = getYearMonthDate(dateObj);
    return "".concat(year, "-").concat(month < 10 ? '0' : '').concat(month, "-").concat(date < 10 ? '0' : '').concat(date);
  }

  function calcOffsetDate(oldDateISO, interval) {
    // Calculate an offset date, assuming:
    // - oldDateISO is type ISO Date (i.e. YYYY-MM-DD) - NB: different from JavaScript's Date type
    // - interval is string of form nn[bdwmq], and could be negative
    // - where 'b' is weekday (i.e. Monday - Friday in English)
    // Return new date as a JS Date
    // v2 method, using built-in NotePlan function 'Calendar.addUnitToDate(date, type, num)'
    const oldDate = new Date(oldDateISO);
    let daysToAdd = 0;
    let monthsToAdd = 0;
    let yearsToAdd = 0;
    const unit = interval.charAt(interval.length - 1); // get last character

    let num = Number(interval.substr(0, interval.length - 1)); // return all but last character
    // console.log("    c_o_d: old = " + oldDate + " / "  + num + " / " + unit)

    switch (unit) {
      case 'b':
        {
          // week days
          // Method from Arjen at https://stackoverflow.com/questions/279296/adding-days-to-a-date-but-excluding-weekends
          // Avoids looping, and copes with negative intervals too
          const currentDayOfWeek = oldDate.getUTCDay(); // = day of week with Sunday = 0, ..Saturday = 6

          let dayOfWeek;

          if (num < 0) {
            dayOfWeek = (currentDayOfWeek - 12) % 7;
          } else {
            dayOfWeek = (currentDayOfWeek + 6) % 7; // % = modulo operator in JSON
          }

          if (dayOfWeek === 6) {
            num--;
          }

          if (dayOfWeek === -6) {
            num++;
          } // console.log("    c_o_d b: " + currentDayOfWeek + " / " + num + " / " + dayOfWeek)


          const numWeekends = Math.trunc((num + dayOfWeek) / 5);
          daysToAdd = num + numWeekends * 2;
          break;
        }

      case 'd':
        daysToAdd = num; // need *1 otherwise treated as a string for some reason

        break;

      case 'w':
        daysToAdd = num * 7;
        break;

      case 'm':
        monthsToAdd = num;
        break;

      case 'q':
        monthsToAdd = num * 3;
        break;

      case 'y':
        yearsToAdd = num;
        break;

      default:
        console.log("\tInvalid date interval: '".concat(interval, "'"));
        break;
    }

    const newDate = daysToAdd > 0 ? Calendar.addUnitToDate(oldDate, 'day', daysToAdd) : monthsToAdd > 0 ? Calendar.addUnitToDate(oldDate, 'month', monthsToAdd) : yearsToAdd > 0 ? Calendar.addUnitToDate(oldDate, 'year', yearsToAdd) : oldDate; // if nothing else, leave date the same

    return newDate;
  }
  /**
   * Return rough relative string version of difference between date and today.
   * Don't return all the detail, but just the most significant unit (year, month, week, day)
   * If date is in the past then adds 'ago'.
   * @param {number} diffIn - number of days difference (positive or negative)
   * @return {string} - relative date string (e.g. today, 3w ago, 2m, 4y ago.)
   */

  function relativeDateFromNumber(diffIn) {
    let output = '';
    let diff = diffIn;
    let isPast = false; // console.log(`original diff = ${diff}`)

    if (diff < 0) {
      diff = Math.abs(diff);
      isPast = true;
    }

    if (diff === 1) {
      output = "".concat(diff, " day");
    } else if (diff < 9) {
      output = "".concat(diff, " days");
    } else if (diff < 12) {
      output = "".concat(Math.round(diff / 7.0), " wk");
    } else if (diff < 29) {
      output = "".concat(Math.round(diff / 7.0), " wks");
    } else if (diff < 550) {
      output = "".concat(Math.round(diff / 30.4), " mon");
    } else {
      output = "".concat(Math.round(diff / 365.0), " yrs");
    }

    if (diff === 0) {
      output = "today";
    } else if (isPast) {
      output += " ago";
    } else {
      output = "in ".concat(output);
    } // console.log(`--> ${output}`)


    return output;
  }
  // Misc functions for NP

  DataStore.defaultFileExtension != null ? DataStore.defaultFileExtension : 'md'; // Pretty print range information (@EduardMe)
  // (@jgclark)

  function displayTitle(n) {
    if (n.type === 'Calendar' && n.date != null) {
      return hyphenatedDate(n.date);
    } else {
      var _n$title;

      return (_n$title = n.title) !== null && _n$title !== void 0 ? _n$title : '';
    }
  } // Return (project) note title as a [[link]]

  function getFolderFromFilename(fullFilename) {
    const filenameParts = fullFilename.split('/'); // console.log(filenameParts)

    return filenameParts.slice(0, filenameParts.length - 1).join('/');
  } // Tests for gFFF function above
  // console.log(`gFFF('one/two/three/four.txt') -> ${getFolderFromFilename('one/two/three/four.txt')}`)
  // console.log(`gFFF('one/two/three/four and a bit.md') -> ${getFolderFromFilename('one/two/three/four and a bit.md')}`)
  // console.log(`gFFF('one/two or three/fifteen.txt') -> ${getFolderFromFilename('one/two or three/fifteen.txt')}`)
  // console.log(`gFFF('/sixes and sevenses/calm one.md') -> ${getFolderFromFilename('sixes and sevenses/calm one.md')}`)

  var parser$1 = function () {
    /*
     * Generated by PEG.js 0.8.0.
     *
     * http://pegjs.majda.cz/
     */
    function peg$subclass(child, parent) {
      function ctor() {
        this.constructor = child;
      }

      ctor.prototype = parent.prototype;
      child.prototype = new ctor();
    }

    function SyntaxError(message, expected, found, offset, line, column) {
      this.message = message;
      this.expected = expected;
      this.found = found;
      this.offset = offset;
      this.line = line;
      this.column = column;
      this.name = "SyntaxError";
    }

    peg$subclass(SyntaxError, Error);

    function parse(input) {
      var options = arguments.length > 1 ? arguments[1] : {},
          peg$FAILED = {},
          peg$startRuleFunctions = {
        start: peg$parsestart
      },
          peg$startRuleFunction = peg$parsestart,
          peg$c1 = function () {
        return nodes;
      },
          peg$c2 = peg$FAILED,
          peg$c3 = "#",
          peg$c4 = {
        type: "literal",
        value: "#",
        description: "\"#\""
      },
          peg$c5 = void 0,
          peg$c6 = {
        type: "any",
        description: "any character"
      },
          peg$c7 = "[",
          peg$c8 = {
        type: "literal",
        value: "[",
        description: "\"[\""
      },
          peg$c9 = "]",
          peg$c10 = {
        type: "literal",
        value: "]",
        description: "\"]\""
      },
          peg$c11 = function (name) {
        addNode(node('ObjectPath', name, line, column));
      },
          peg$c12 = function (name) {
        addNode(node('ArrayPath', name, line, column));
      },
          peg$c13 = function (parts, name) {
        return parts.concat(name);
      },
          peg$c14 = function (name) {
        return [name];
      },
          peg$c15 = function (name) {
        return name;
      },
          peg$c16 = ".",
          peg$c17 = {
        type: "literal",
        value: ".",
        description: "\".\""
      },
          peg$c18 = "=",
          peg$c19 = {
        type: "literal",
        value: "=",
        description: "\"=\""
      },
          peg$c20 = function (key, value) {
        addNode(node('Assign', value, line, column, key));
      },
          peg$c21 = function (chars) {
        return chars.join('');
      },
          peg$c22 = function (node) {
        return node.value;
      },
          peg$c23 = "\"\"\"",
          peg$c24 = {
        type: "literal",
        value: "\"\"\"",
        description: "\"\\\"\\\"\\\"\""
      },
          peg$c25 = null,
          peg$c26 = function (chars) {
        return node('String', chars.join(''), line, column);
      },
          peg$c27 = "\"",
          peg$c28 = {
        type: "literal",
        value: "\"",
        description: "\"\\\"\""
      },
          peg$c29 = "'''",
          peg$c30 = {
        type: "literal",
        value: "'''",
        description: "\"'''\""
      },
          peg$c31 = "'",
          peg$c32 = {
        type: "literal",
        value: "'",
        description: "\"'\""
      },
          peg$c33 = function (char) {
        return char;
      },
          peg$c34 = function (char) {
        return char;
      },
          peg$c35 = "\\",
          peg$c36 = {
        type: "literal",
        value: "\\",
        description: "\"\\\\\""
      },
          peg$c37 = function () {
        return '';
      },
          peg$c38 = "e",
          peg$c39 = {
        type: "literal",
        value: "e",
        description: "\"e\""
      },
          peg$c40 = "E",
          peg$c41 = {
        type: "literal",
        value: "E",
        description: "\"E\""
      },
          peg$c42 = function (left, right) {
        return node('Float', parseFloat(left + 'e' + right), line, column);
      },
          peg$c43 = function (text) {
        return node('Float', parseFloat(text), line, column);
      },
          peg$c44 = "+",
          peg$c45 = {
        type: "literal",
        value: "+",
        description: "\"+\""
      },
          peg$c46 = function (digits) {
        return digits.join('');
      },
          peg$c47 = "-",
          peg$c48 = {
        type: "literal",
        value: "-",
        description: "\"-\""
      },
          peg$c49 = function (digits) {
        return '-' + digits.join('');
      },
          peg$c50 = function (text) {
        return node('Integer', parseInt(text, 10), line, column);
      },
          peg$c51 = "true",
          peg$c52 = {
        type: "literal",
        value: "true",
        description: "\"true\""
      },
          peg$c53 = function () {
        return node('Boolean', true, line, column);
      },
          peg$c54 = "false",
          peg$c55 = {
        type: "literal",
        value: "false",
        description: "\"false\""
      },
          peg$c56 = function () {
        return node('Boolean', false, line, column);
      },
          peg$c57 = function () {
        return node('Array', [], line, column);
      },
          peg$c58 = function (value) {
        return node('Array', value ? [value] : [], line, column);
      },
          peg$c59 = function (values) {
        return node('Array', values, line, column);
      },
          peg$c60 = function (values, value) {
        return node('Array', values.concat(value), line, column);
      },
          peg$c61 = function (value) {
        return value;
      },
          peg$c62 = ",",
          peg$c63 = {
        type: "literal",
        value: ",",
        description: "\",\""
      },
          peg$c64 = "{",
          peg$c65 = {
        type: "literal",
        value: "{",
        description: "\"{\""
      },
          peg$c66 = "}",
          peg$c67 = {
        type: "literal",
        value: "}",
        description: "\"}\""
      },
          peg$c68 = function (values) {
        return node('InlineTable', values, line, column);
      },
          peg$c69 = function (key, value) {
        return node('InlineTableValue', value, line, column, key);
      },
          peg$c70 = function (digits) {
        return "." + digits;
      },
          peg$c71 = function (date) {
        return date.join('');
      },
          peg$c72 = ":",
          peg$c73 = {
        type: "literal",
        value: ":",
        description: "\":\""
      },
          peg$c74 = function (time) {
        return time.join('');
      },
          peg$c75 = "T",
          peg$c76 = {
        type: "literal",
        value: "T",
        description: "\"T\""
      },
          peg$c77 = "Z",
          peg$c78 = {
        type: "literal",
        value: "Z",
        description: "\"Z\""
      },
          peg$c79 = function (date, time) {
        return node('Date', new Date(date + "T" + time + "Z"), line, column);
      },
          peg$c80 = function (date, time) {
        return node('Date', new Date(date + "T" + time), line, column);
      },
          peg$c81 = /^[ \t]/,
          peg$c82 = {
        type: "class",
        value: "[ \\t]",
        description: "[ \\t]"
      },
          peg$c83 = "\n",
          peg$c84 = {
        type: "literal",
        value: "\n",
        description: "\"\\n\""
      },
          peg$c85 = "\r",
          peg$c86 = {
        type: "literal",
        value: "\r",
        description: "\"\\r\""
      },
          peg$c87 = /^[0-9a-f]/i,
          peg$c88 = {
        type: "class",
        value: "[0-9a-f]i",
        description: "[0-9a-f]i"
      },
          peg$c89 = /^[0-9]/,
          peg$c90 = {
        type: "class",
        value: "[0-9]",
        description: "[0-9]"
      },
          peg$c91 = "_",
          peg$c92 = {
        type: "literal",
        value: "_",
        description: "\"_\""
      },
          peg$c93 = function () {
        return "";
      },
          peg$c94 = /^[A-Za-z0-9_\-]/,
          peg$c95 = {
        type: "class",
        value: "[A-Za-z0-9_\\-]",
        description: "[A-Za-z0-9_\\-]"
      },
          peg$c96 = function (d) {
        return d.join('');
      },
          peg$c97 = "\\\"",
          peg$c98 = {
        type: "literal",
        value: "\\\"",
        description: "\"\\\\\\\"\""
      },
          peg$c99 = function () {
        return '"';
      },
          peg$c100 = "\\\\",
          peg$c101 = {
        type: "literal",
        value: "\\\\",
        description: "\"\\\\\\\\\""
      },
          peg$c102 = function () {
        return '\\';
      },
          peg$c103 = "\\b",
          peg$c104 = {
        type: "literal",
        value: "\\b",
        description: "\"\\\\b\""
      },
          peg$c105 = function () {
        return '\b';
      },
          peg$c106 = "\\t",
          peg$c107 = {
        type: "literal",
        value: "\\t",
        description: "\"\\\\t\""
      },
          peg$c108 = function () {
        return '\t';
      },
          peg$c109 = "\\n",
          peg$c110 = {
        type: "literal",
        value: "\\n",
        description: "\"\\\\n\""
      },
          peg$c111 = function () {
        return '\n';
      },
          peg$c112 = "\\f",
          peg$c113 = {
        type: "literal",
        value: "\\f",
        description: "\"\\\\f\""
      },
          peg$c114 = function () {
        return '\f';
      },
          peg$c115 = "\\r",
          peg$c116 = {
        type: "literal",
        value: "\\r",
        description: "\"\\\\r\""
      },
          peg$c117 = function () {
        return '\r';
      },
          peg$c118 = "\\U",
          peg$c119 = {
        type: "literal",
        value: "\\U",
        description: "\"\\\\U\""
      },
          peg$c120 = function (digits) {
        return convertCodePoint(digits.join(''));
      },
          peg$c121 = "\\u",
          peg$c122 = {
        type: "literal",
        value: "\\u",
        description: "\"\\\\u\""
      },
          peg$currPos = 0,
          peg$reportedPos = 0,
          peg$cachedPos = 0,
          peg$cachedPosDetails = {
        line: 1,
        column: 1,
        seenCR: false
      },
          peg$maxFailPos = 0,
          peg$maxFailExpected = [],
          peg$silentFails = 0,
          peg$cache = {},
          peg$result;

      if ("startRule" in options) {
        if (!(options.startRule in peg$startRuleFunctions)) {
          throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
        }

        peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
      }

      function line() {
        return peg$computePosDetails(peg$reportedPos).line;
      }

      function column() {
        return peg$computePosDetails(peg$reportedPos).column;
      }

      function peg$computePosDetails(pos) {
        function advance(details, startPos, endPos) {
          var p, ch;

          for (p = startPos; p < endPos; p++) {
            ch = input.charAt(p);

            if (ch === "\n") {
              if (!details.seenCR) {
                details.line++;
              }

              details.column = 1;
              details.seenCR = false;
            } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
              details.line++;
              details.column = 1;
              details.seenCR = true;
            } else {
              details.column++;
              details.seenCR = false;
            }
          }
        }

        if (peg$cachedPos !== pos) {
          if (peg$cachedPos > pos) {
            peg$cachedPos = 0;
            peg$cachedPosDetails = {
              line: 1,
              column: 1,
              seenCR: false
            };
          }

          advance(peg$cachedPosDetails, peg$cachedPos, pos);
          peg$cachedPos = pos;
        }

        return peg$cachedPosDetails;
      }

      function peg$fail(expected) {
        if (peg$currPos < peg$maxFailPos) {
          return;
        }

        if (peg$currPos > peg$maxFailPos) {
          peg$maxFailPos = peg$currPos;
          peg$maxFailExpected = [];
        }

        peg$maxFailExpected.push(expected);
      }

      function peg$buildException(message, expected, pos) {
        function cleanupExpected(expected) {
          var i = 1;
          expected.sort(function (a, b) {
            if (a.description < b.description) {
              return -1;
            } else if (a.description > b.description) {
              return 1;
            } else {
              return 0;
            }
          });

          while (i < expected.length) {
            if (expected[i - 1] === expected[i]) {
              expected.splice(i, 1);
            } else {
              i++;
            }
          }
        }

        function buildMessage(expected, found) {
          function stringEscape(s) {
            function hex(ch) {
              return ch.charCodeAt(0).toString(16).toUpperCase();
            }

            return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\x08/g, '\\b').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\f/g, '\\f').replace(/\r/g, '\\r').replace(/[\x00-\x07\x0B\x0E\x0F]/g, function (ch) {
              return '\\x0' + hex(ch);
            }).replace(/[\x10-\x1F\x80-\xFF]/g, function (ch) {
              return '\\x' + hex(ch);
            }).replace(/[\u0180-\u0FFF]/g, function (ch) {
              return '\\u0' + hex(ch);
            }).replace(/[\u1080-\uFFFF]/g, function (ch) {
              return '\\u' + hex(ch);
            });
          }

          var expectedDescs = new Array(expected.length),
              expectedDesc,
              foundDesc,
              i;

          for (i = 0; i < expected.length; i++) {
            expectedDescs[i] = expected[i].description;
          }

          expectedDesc = expected.length > 1 ? expectedDescs.slice(0, -1).join(", ") + " or " + expectedDescs[expected.length - 1] : expectedDescs[0];
          foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";
          return "Expected " + expectedDesc + " but " + foundDesc + " found.";
        }

        var posDetails = peg$computePosDetails(pos),
            found = pos < input.length ? input.charAt(pos) : null;

        if (expected !== null) {
          cleanupExpected(expected);
        }

        return new SyntaxError(message !== null ? message : buildMessage(expected, found), expected, found, pos, posDetails.line, posDetails.column);
      }

      function peg$parsestart() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 0,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseline();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseline();
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c1();
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseline() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 49 + 1,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parseexpression();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }

            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parsecomment();

              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parsecomment();
              }

              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseNL();

                if (s6 !== peg$FAILED) {
                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseNL();
                  }
                } else {
                  s5 = peg$c2;
                }

                if (s5 === peg$FAILED) {
                  s5 = peg$parseEOF();
                }

                if (s5 !== peg$FAILED) {
                  s1 = [s1, s2, s3, s4, s5];
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseS();

          if (s2 !== peg$FAILED) {
            while (s2 !== peg$FAILED) {
              s1.push(s2);
              s2 = peg$parseS();
            }
          } else {
            s1 = peg$c2;
          }

          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseNL();

            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseNL();
              }
            } else {
              s2 = peg$c2;
            }

            if (s2 === peg$FAILED) {
              s2 = peg$parseEOF();
            }

            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }

          if (s0 === peg$FAILED) {
            s0 = peg$parseNL();
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseexpression() {
        var s0;
        var key = peg$currPos * 49 + 2,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parsecomment();

        if (s0 === peg$FAILED) {
          s0 = peg$parsepath();

          if (s0 === peg$FAILED) {
            s0 = peg$parsetablearray();

            if (s0 === peg$FAILED) {
              s0 = peg$parseassignment();
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsecomment() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 49 + 3,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 35) {
          s1 = peg$c3;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c4);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$currPos;
          s4 = peg$currPos;
          peg$silentFails++;
          s5 = peg$parseNL();

          if (s5 === peg$FAILED) {
            s5 = peg$parseEOF();
          }

          peg$silentFails--;

          if (s5 === peg$FAILED) {
            s4 = peg$c5;
          } else {
            peg$currPos = s4;
            s4 = peg$c2;
          }

          if (s4 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s5 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s5 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c6);
              }
            }

            if (s5 !== peg$FAILED) {
              s4 = [s4, s5];
              s3 = s4;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          } else {
            peg$currPos = s3;
            s3 = peg$c2;
          }

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$currPos;
            s4 = peg$currPos;
            peg$silentFails++;
            s5 = peg$parseNL();

            if (s5 === peg$FAILED) {
              s5 = peg$parseEOF();
            }

            peg$silentFails--;

            if (s5 === peg$FAILED) {
              s4 = peg$c5;
            } else {
              peg$currPos = s4;
              s4 = peg$c2;
            }

            if (s4 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s5 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s5 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }

              if (s5 !== peg$FAILED) {
                s4 = [s4, s5];
                s3 = s4;
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }
          }

          if (s2 !== peg$FAILED) {
            s1 = [s1, s2];
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsepath() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 49 + 4,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c7;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c8);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseS();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseS();
          }

          if (s2 !== peg$FAILED) {
            s3 = peg$parsetable_key();

            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parseS();

              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parseS();
              }

              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s5 = peg$c9;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c10);
                  }
                }

                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c11(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsetablearray() {
        var s0, s1, s2, s3, s4, s5, s6, s7;
        var key = peg$currPos * 49 + 5,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c7;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c8);
          }
        }

        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 91) {
            s2 = peg$c7;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }

            if (s3 !== peg$FAILED) {
              s4 = peg$parsetable_key();

              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseS();

                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseS();
                }

                if (s5 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 93) {
                    s6 = peg$c9;
                    peg$currPos++;
                  } else {
                    s6 = peg$FAILED;

                    if (peg$silentFails === 0) {
                      peg$fail(peg$c10);
                    }
                  }

                  if (s6 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s7 = peg$c9;
                      peg$currPos++;
                    } else {
                      s7 = peg$FAILED;

                      if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                      }
                    }

                    if (s7 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c12(s4);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsetable_key() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 6,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsedot_ended_table_key_part();

        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parsedot_ended_table_key_part();
          }
        } else {
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsetable_key_part();

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c13(s1, s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsetable_key_part();

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c14(s1);
          }

          s0 = s1;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsetable_key_part() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 7,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsekey();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c15(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseS();

          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseS();
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$parsequoted_key();

            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseS();

              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parseS();
              }

              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c15(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsedot_ended_table_key_part() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 49 + 8,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsekey();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }

            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c16;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c17);
                }
              }

              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseS();

                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseS();
                }

                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c15(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseS();

          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseS();
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$parsequoted_key();

            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseS();

              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parseS();
              }

              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 46) {
                  s4 = peg$c16;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c17);
                  }
                }

                if (s4 !== peg$FAILED) {
                  s5 = [];
                  s6 = peg$parseS();

                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseS();
                  }

                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c15(s2);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseassignment() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 49 + 9,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$parsekey();

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseS();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseS();
          }

          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 61) {
              s3 = peg$c18;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c19);
              }
            }

            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parseS();

              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parseS();
              }

              if (s4 !== peg$FAILED) {
                s5 = peg$parsevalue();

                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c20(s1, s5);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsequoted_key();

          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseS();

            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseS();
            }

            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s3 = peg$c18;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c19);
                }
              }

              if (s3 !== peg$FAILED) {
                s4 = [];
                s5 = peg$parseS();

                while (s5 !== peg$FAILED) {
                  s4.push(s5);
                  s5 = peg$parseS();
                }

                if (s4 !== peg$FAILED) {
                  s5 = peg$parsevalue();

                  if (s5 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c20(s1, s5);
                    s0 = s1;
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsekey() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 10,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseASCII_BASIC();

        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseASCII_BASIC();
          }
        } else {
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c21(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsequoted_key() {
        var s0, s1;
        var key = peg$currPos * 49 + 11,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$parsedouble_quoted_single_line_string();

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c22(s1);
        }

        s0 = s1;

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsesingle_quoted_single_line_string();

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c22(s1);
          }

          s0 = s1;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsevalue() {
        var s0;
        var key = peg$currPos * 49 + 12,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parsestring();

        if (s0 === peg$FAILED) {
          s0 = peg$parsedatetime();

          if (s0 === peg$FAILED) {
            s0 = peg$parsefloat();

            if (s0 === peg$FAILED) {
              s0 = peg$parseinteger();

              if (s0 === peg$FAILED) {
                s0 = peg$parseboolean();

                if (s0 === peg$FAILED) {
                  s0 = peg$parsearray();

                  if (s0 === peg$FAILED) {
                    s0 = peg$parseinline_table();
                  }
                }
              }
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsestring() {
        var s0;
        var key = peg$currPos * 49 + 13,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parsedouble_quoted_multiline_string();

        if (s0 === peg$FAILED) {
          s0 = peg$parsedouble_quoted_single_line_string();

          if (s0 === peg$FAILED) {
            s0 = peg$parsesingle_quoted_multiline_string();

            if (s0 === peg$FAILED) {
              s0 = peg$parsesingle_quoted_single_line_string();
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsedouble_quoted_multiline_string() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 14,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.substr(peg$currPos, 3) === peg$c23) {
          s1 = peg$c23;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c24);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parseNL();

          if (s2 === peg$FAILED) {
            s2 = peg$c25;
          }

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsemultiline_string_char();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsemultiline_string_char();
            }

            if (s3 !== peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c23) {
                s4 = peg$c23;
                peg$currPos += 3;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c24);
                }
              }

              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c26(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsedouble_quoted_single_line_string() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 49 + 15,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 34) {
          s1 = peg$c27;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c28);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parsestring_char();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsestring_char();
          }

          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 34) {
              s3 = peg$c27;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c28);
              }
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c26(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsesingle_quoted_multiline_string() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 16,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.substr(peg$currPos, 3) === peg$c29) {
          s1 = peg$c29;
          peg$currPos += 3;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c30);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parseNL();

          if (s2 === peg$FAILED) {
            s2 = peg$c25;
          }

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsemultiline_literal_char();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsemultiline_literal_char();
            }

            if (s3 !== peg$FAILED) {
              if (input.substr(peg$currPos, 3) === peg$c29) {
                s4 = peg$c29;
                peg$currPos += 3;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c30);
                }
              }

              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c26(s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsesingle_quoted_single_line_string() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 49 + 17,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 39) {
          s1 = peg$c31;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c32);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseliteral_char();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseliteral_char();
          }

          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 39) {
              s3 = peg$c31;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c32);
              }
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c26(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsestring_char() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 18,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parseESCAPED();

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$currPos;
          peg$silentFails++;

          if (input.charCodeAt(peg$currPos) === 34) {
            s2 = peg$c27;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c28);
            }
          }

          peg$silentFails--;

          if (s2 === peg$FAILED) {
            s1 = peg$c5;
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }

          if (s1 !== peg$FAILED) {
            if (input.length > peg$currPos) {
              s2 = input.charAt(peg$currPos);
              peg$currPos++;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c6);
              }
            }

            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c33(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseliteral_char() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 19,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;

        if (input.charCodeAt(peg$currPos) === 39) {
          s2 = peg$c31;
          peg$currPos++;
        } else {
          s2 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c32);
          }
        }

        peg$silentFails--;

        if (s2 === peg$FAILED) {
          s1 = peg$c5;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c6);
            }
          }

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c33(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsemultiline_string_char() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 20,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parseESCAPED();

        if (s0 === peg$FAILED) {
          s0 = peg$parsemultiline_string_delim();

          if (s0 === peg$FAILED) {
            s0 = peg$currPos;
            s1 = peg$currPos;
            peg$silentFails++;

            if (input.substr(peg$currPos, 3) === peg$c23) {
              s2 = peg$c23;
              peg$currPos += 3;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c24);
              }
            }

            peg$silentFails--;

            if (s2 === peg$FAILED) {
              s1 = peg$c5;
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }

            if (s1 !== peg$FAILED) {
              if (input.length > peg$currPos) {
                s2 = input.charAt(peg$currPos);
                peg$currPos++;
              } else {
                s2 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c6);
                }
              }

              if (s2 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c34(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsemultiline_string_delim() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 21,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 92) {
          s1 = peg$c35;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c36);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parseNL();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseNLS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseNLS();
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c37();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsemultiline_literal_char() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 22,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$currPos;
        peg$silentFails++;

        if (input.substr(peg$currPos, 3) === peg$c29) {
          s2 = peg$c29;
          peg$currPos += 3;
        } else {
          s2 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c30);
          }
        }

        peg$silentFails--;

        if (s2 === peg$FAILED) {
          s1 = peg$c5;
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          if (input.length > peg$currPos) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c6);
            }
          }

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c33(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsefloat() {
        var s0, s1, s2, s3;
        var key = peg$currPos * 49 + 23,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$parsefloat_text();

        if (s1 === peg$FAILED) {
          s1 = peg$parseinteger_text();
        }

        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 101) {
            s2 = peg$c38;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c39);
            }
          }

          if (s2 === peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 69) {
              s2 = peg$c40;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c41);
              }
            }
          }

          if (s2 !== peg$FAILED) {
            s3 = peg$parseinteger_text();

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c42(s1, s3);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsefloat_text();

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c43(s1);
          }

          s0 = s1;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsefloat_text() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 49 + 24,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 43) {
          s1 = peg$c44;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c45);
          }
        }

        if (s1 === peg$FAILED) {
          s1 = peg$c25;
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parseDIGITS();

          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c16;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c17);
              }
            }

            if (s4 !== peg$FAILED) {
              s5 = peg$parseDIGITS();

              if (s5 !== peg$FAILED) {
                s3 = [s3, s4, s5];
                s2 = s3;
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c46(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c47;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c48);
            }
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseDIGITS();

            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c16;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c17);
                }
              }

              if (s4 !== peg$FAILED) {
                s5 = peg$parseDIGITS();

                if (s5 !== peg$FAILED) {
                  s3 = [s3, s4, s5];
                  s2 = s3;
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }

            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c49(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseinteger() {
        var s0, s1;
        var key = peg$currPos * 49 + 25,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$parseinteger_text();

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c50(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseinteger_text() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 26,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 43) {
          s1 = peg$c44;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c45);
          }
        }

        if (s1 === peg$FAILED) {
          s1 = peg$c25;
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseDIGIT_OR_UNDER();

          if (s3 !== peg$FAILED) {
            while (s3 !== peg$FAILED) {
              s2.push(s3);
              s3 = peg$parseDIGIT_OR_UNDER();
            }
          } else {
            s2 = peg$c2;
          }

          if (s2 !== peg$FAILED) {
            s3 = peg$currPos;
            peg$silentFails++;

            if (input.charCodeAt(peg$currPos) === 46) {
              s4 = peg$c16;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c17);
              }
            }

            peg$silentFails--;

            if (s4 === peg$FAILED) {
              s3 = peg$c5;
            } else {
              peg$currPos = s3;
              s3 = peg$c2;
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c46(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 45) {
            s1 = peg$c47;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c48);
            }
          }

          if (s1 !== peg$FAILED) {
            s2 = [];
            s3 = peg$parseDIGIT_OR_UNDER();

            if (s3 !== peg$FAILED) {
              while (s3 !== peg$FAILED) {
                s2.push(s3);
                s3 = peg$parseDIGIT_OR_UNDER();
              }
            } else {
              s2 = peg$c2;
            }

            if (s2 !== peg$FAILED) {
              s3 = peg$currPos;
              peg$silentFails++;

              if (input.charCodeAt(peg$currPos) === 46) {
                s4 = peg$c16;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c17);
                }
              }

              peg$silentFails--;

              if (s4 === peg$FAILED) {
                s3 = peg$c5;
              } else {
                peg$currPos = s3;
                s3 = peg$c2;
              }

              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c49(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseboolean() {
        var s0, s1;
        var key = peg$currPos * 49 + 27,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.substr(peg$currPos, 4) === peg$c51) {
          s1 = peg$c51;
          peg$currPos += 4;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c52);
          }
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c53();
        }

        s0 = s1;

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.substr(peg$currPos, 5) === peg$c54) {
            s1 = peg$c54;
            peg$currPos += 5;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c55);
            }
          }

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c56();
          }

          s0 = s1;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsearray() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 28,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 91) {
          s1 = peg$c7;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c8);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parsearray_sep();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parsearray_sep();
          }

          if (s2 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 93) {
              s3 = peg$c9;
              peg$currPos++;
            } else {
              s3 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c10);
              }
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c57();
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 91) {
            s1 = peg$c7;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c8);
            }
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$parsearray_value();

            if (s2 === peg$FAILED) {
              s2 = peg$c25;
            }

            if (s2 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 93) {
                s3 = peg$c9;
                peg$currPos++;
              } else {
                s3 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c10);
                }
              }

              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c58(s2);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }

          if (s0 === peg$FAILED) {
            s0 = peg$currPos;

            if (input.charCodeAt(peg$currPos) === 91) {
              s1 = peg$c7;
              peg$currPos++;
            } else {
              s1 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c8);
              }
            }

            if (s1 !== peg$FAILED) {
              s2 = [];
              s3 = peg$parsearray_value_list();

              if (s3 !== peg$FAILED) {
                while (s3 !== peg$FAILED) {
                  s2.push(s3);
                  s3 = peg$parsearray_value_list();
                }
              } else {
                s2 = peg$c2;
              }

              if (s2 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 93) {
                  s3 = peg$c9;
                  peg$currPos++;
                } else {
                  s3 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c10);
                  }
                }

                if (s3 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c59(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }

            if (s0 === peg$FAILED) {
              s0 = peg$currPos;

              if (input.charCodeAt(peg$currPos) === 91) {
                s1 = peg$c7;
                peg$currPos++;
              } else {
                s1 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c8);
                }
              }

              if (s1 !== peg$FAILED) {
                s2 = [];
                s3 = peg$parsearray_value_list();

                if (s3 !== peg$FAILED) {
                  while (s3 !== peg$FAILED) {
                    s2.push(s3);
                    s3 = peg$parsearray_value_list();
                  }
                } else {
                  s2 = peg$c2;
                }

                if (s2 !== peg$FAILED) {
                  s3 = peg$parsearray_value();

                  if (s3 !== peg$FAILED) {
                    if (input.charCodeAt(peg$currPos) === 93) {
                      s4 = peg$c9;
                      peg$currPos++;
                    } else {
                      s4 = peg$FAILED;

                      if (peg$silentFails === 0) {
                        peg$fail(peg$c10);
                      }
                    }

                    if (s4 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c60(s2, s3);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsearray_value() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 29,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsearray_sep();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsearray_sep();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsevalue();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsearray_sep();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsearray_sep();
            }

            if (s3 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c61(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsearray_value_list() {
        var s0, s1, s2, s3, s4, s5, s6;
        var key = peg$currPos * 49 + 30,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parsearray_sep();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parsearray_sep();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsevalue();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parsearray_sep();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parsearray_sep();
            }

            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 44) {
                s4 = peg$c62;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c63);
                }
              }

              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parsearray_sep();

                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parsearray_sep();
                }

                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c61(s2);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsearray_sep() {
        var s0;
        var key = peg$currPos * 49 + 31,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parseS();

        if (s0 === peg$FAILED) {
          s0 = peg$parseNL();

          if (s0 === peg$FAILED) {
            s0 = peg$parsecomment();
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseinline_table() {
        var s0, s1, s2, s3, s4, s5;
        var key = peg$currPos * 49 + 32,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 123) {
          s1 = peg$c64;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c65);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = [];
          s3 = peg$parseS();

          while (s3 !== peg$FAILED) {
            s2.push(s3);
            s3 = peg$parseS();
          }

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseinline_table_assignment();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseinline_table_assignment();
            }

            if (s3 !== peg$FAILED) {
              s4 = [];
              s5 = peg$parseS();

              while (s5 !== peg$FAILED) {
                s4.push(s5);
                s5 = peg$parseS();
              }

              if (s4 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 125) {
                  s5 = peg$c66;
                  peg$currPos++;
                } else {
                  s5 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c67);
                  }
                }

                if (s5 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c68(s3);
                  s0 = s1;
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseinline_table_assignment() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        var key = peg$currPos * 49 + 33,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseS();

        while (s2 !== peg$FAILED) {
          s1.push(s2);
          s2 = peg$parseS();
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parsekey();

          if (s2 !== peg$FAILED) {
            s3 = [];
            s4 = peg$parseS();

            while (s4 !== peg$FAILED) {
              s3.push(s4);
              s4 = peg$parseS();
            }

            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 61) {
                s4 = peg$c18;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c19);
                }
              }

              if (s4 !== peg$FAILED) {
                s5 = [];
                s6 = peg$parseS();

                while (s6 !== peg$FAILED) {
                  s5.push(s6);
                  s6 = peg$parseS();
                }

                if (s5 !== peg$FAILED) {
                  s6 = peg$parsevalue();

                  if (s6 !== peg$FAILED) {
                    s7 = [];
                    s8 = peg$parseS();

                    while (s8 !== peg$FAILED) {
                      s7.push(s8);
                      s8 = peg$parseS();
                    }

                    if (s7 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 44) {
                        s8 = peg$c62;
                        peg$currPos++;
                      } else {
                        s8 = peg$FAILED;

                        if (peg$silentFails === 0) {
                          peg$fail(peg$c63);
                        }
                      }

                      if (s8 !== peg$FAILED) {
                        s9 = [];
                        s10 = peg$parseS();

                        while (s10 !== peg$FAILED) {
                          s9.push(s10);
                          s10 = peg$parseS();
                        }

                        if (s9 !== peg$FAILED) {
                          peg$reportedPos = s0;
                          s1 = peg$c69(s2, s6);
                          s0 = s1;
                        } else {
                          peg$currPos = s0;
                          s0 = peg$c2;
                        }
                      } else {
                        peg$currPos = s0;
                        s0 = peg$c2;
                      }
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = [];
          s2 = peg$parseS();

          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseS();
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$parsekey();

            if (s2 !== peg$FAILED) {
              s3 = [];
              s4 = peg$parseS();

              while (s4 !== peg$FAILED) {
                s3.push(s4);
                s4 = peg$parseS();
              }

              if (s3 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 61) {
                  s4 = peg$c18;
                  peg$currPos++;
                } else {
                  s4 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c19);
                  }
                }

                if (s4 !== peg$FAILED) {
                  s5 = [];
                  s6 = peg$parseS();

                  while (s6 !== peg$FAILED) {
                    s5.push(s6);
                    s6 = peg$parseS();
                  }

                  if (s5 !== peg$FAILED) {
                    s6 = peg$parsevalue();

                    if (s6 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c69(s2, s6);
                      s0 = s1;
                    } else {
                      peg$currPos = s0;
                      s0 = peg$c2;
                    }
                  } else {
                    peg$currPos = s0;
                    s0 = peg$c2;
                  }
                } else {
                  peg$currPos = s0;
                  s0 = peg$c2;
                }
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsesecfragment() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 34,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.charCodeAt(peg$currPos) === 46) {
          s1 = peg$c16;
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c17);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$parseDIGITS();

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c70(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsedate() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11;
        var key = peg$currPos * 49 + 35,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseDIGIT_OR_UNDER();

        if (s2 !== peg$FAILED) {
          s3 = peg$parseDIGIT_OR_UNDER();

          if (s3 !== peg$FAILED) {
            s4 = peg$parseDIGIT_OR_UNDER();

            if (s4 !== peg$FAILED) {
              s5 = peg$parseDIGIT_OR_UNDER();

              if (s5 !== peg$FAILED) {
                if (input.charCodeAt(peg$currPos) === 45) {
                  s6 = peg$c47;
                  peg$currPos++;
                } else {
                  s6 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c48);
                  }
                }

                if (s6 !== peg$FAILED) {
                  s7 = peg$parseDIGIT_OR_UNDER();

                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseDIGIT_OR_UNDER();

                    if (s8 !== peg$FAILED) {
                      if (input.charCodeAt(peg$currPos) === 45) {
                        s9 = peg$c47;
                        peg$currPos++;
                      } else {
                        s9 = peg$FAILED;

                        if (peg$silentFails === 0) {
                          peg$fail(peg$c48);
                        }
                      }

                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseDIGIT_OR_UNDER();

                        if (s10 !== peg$FAILED) {
                          s11 = peg$parseDIGIT_OR_UNDER();

                          if (s11 !== peg$FAILED) {
                            s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11];
                            s1 = s2;
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c71(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsetime() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        var key = peg$currPos * 49 + 36,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseDIGIT_OR_UNDER();

        if (s2 !== peg$FAILED) {
          s3 = peg$parseDIGIT_OR_UNDER();

          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c73);
              }
            }

            if (s4 !== peg$FAILED) {
              s5 = peg$parseDIGIT_OR_UNDER();

              if (s5 !== peg$FAILED) {
                s6 = peg$parseDIGIT_OR_UNDER();

                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 58) {
                    s7 = peg$c72;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;

                    if (peg$silentFails === 0) {
                      peg$fail(peg$c73);
                    }
                  }

                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseDIGIT_OR_UNDER();

                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseDIGIT_OR_UNDER();

                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsesecfragment();

                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }

                        if (s10 !== peg$FAILED) {
                          s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10];
                          s1 = s2;
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c74(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsetime_with_offset() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16;
        var key = peg$currPos * 49 + 37,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$currPos;
        s2 = peg$parseDIGIT_OR_UNDER();

        if (s2 !== peg$FAILED) {
          s3 = peg$parseDIGIT_OR_UNDER();

          if (s3 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 58) {
              s4 = peg$c72;
              peg$currPos++;
            } else {
              s4 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c73);
              }
            }

            if (s4 !== peg$FAILED) {
              s5 = peg$parseDIGIT_OR_UNDER();

              if (s5 !== peg$FAILED) {
                s6 = peg$parseDIGIT_OR_UNDER();

                if (s6 !== peg$FAILED) {
                  if (input.charCodeAt(peg$currPos) === 58) {
                    s7 = peg$c72;
                    peg$currPos++;
                  } else {
                    s7 = peg$FAILED;

                    if (peg$silentFails === 0) {
                      peg$fail(peg$c73);
                    }
                  }

                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseDIGIT_OR_UNDER();

                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseDIGIT_OR_UNDER();

                      if (s9 !== peg$FAILED) {
                        s10 = peg$parsesecfragment();

                        if (s10 === peg$FAILED) {
                          s10 = peg$c25;
                        }

                        if (s10 !== peg$FAILED) {
                          if (input.charCodeAt(peg$currPos) === 45) {
                            s11 = peg$c47;
                            peg$currPos++;
                          } else {
                            s11 = peg$FAILED;

                            if (peg$silentFails === 0) {
                              peg$fail(peg$c48);
                            }
                          }

                          if (s11 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 43) {
                              s11 = peg$c44;
                              peg$currPos++;
                            } else {
                              s11 = peg$FAILED;

                              if (peg$silentFails === 0) {
                                peg$fail(peg$c45);
                              }
                            }
                          }

                          if (s11 !== peg$FAILED) {
                            s12 = peg$parseDIGIT_OR_UNDER();

                            if (s12 !== peg$FAILED) {
                              s13 = peg$parseDIGIT_OR_UNDER();

                              if (s13 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 58) {
                                  s14 = peg$c72;
                                  peg$currPos++;
                                } else {
                                  s14 = peg$FAILED;

                                  if (peg$silentFails === 0) {
                                    peg$fail(peg$c73);
                                  }
                                }

                                if (s14 !== peg$FAILED) {
                                  s15 = peg$parseDIGIT_OR_UNDER();

                                  if (s15 !== peg$FAILED) {
                                    s16 = peg$parseDIGIT_OR_UNDER();

                                    if (s16 !== peg$FAILED) {
                                      s2 = [s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12, s13, s14, s15, s16];
                                      s1 = s2;
                                    } else {
                                      peg$currPos = s1;
                                      s1 = peg$c2;
                                    }
                                  } else {
                                    peg$currPos = s1;
                                    s1 = peg$c2;
                                  }
                                } else {
                                  peg$currPos = s1;
                                  s1 = peg$c2;
                                }
                              } else {
                                peg$currPos = s1;
                                s1 = peg$c2;
                              }
                            } else {
                              peg$currPos = s1;
                              s1 = peg$c2;
                            }
                          } else {
                            peg$currPos = s1;
                            s1 = peg$c2;
                          }
                        } else {
                          peg$currPos = s1;
                          s1 = peg$c2;
                        }
                      } else {
                        peg$currPos = s1;
                        s1 = peg$c2;
                      }
                    } else {
                      peg$currPos = s1;
                      s1 = peg$c2;
                    }
                  } else {
                    peg$currPos = s1;
                    s1 = peg$c2;
                  }
                } else {
                  peg$currPos = s1;
                  s1 = peg$c2;
                }
              } else {
                peg$currPos = s1;
                s1 = peg$c2;
              }
            } else {
              peg$currPos = s1;
              s1 = peg$c2;
            }
          } else {
            peg$currPos = s1;
            s1 = peg$c2;
          }
        } else {
          peg$currPos = s1;
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c74(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parsedatetime() {
        var s0, s1, s2, s3, s4;
        var key = peg$currPos * 49 + 38,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = peg$parsedate();

        if (s1 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 84) {
            s2 = peg$c75;
            peg$currPos++;
          } else {
            s2 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c76);
            }
          }

          if (s2 !== peg$FAILED) {
            s3 = peg$parsetime();

            if (s3 !== peg$FAILED) {
              if (input.charCodeAt(peg$currPos) === 90) {
                s4 = peg$c77;
                peg$currPos++;
              } else {
                s4 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c78);
                }
              }

              if (s4 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c79(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;
          s1 = peg$parsedate();

          if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 84) {
              s2 = peg$c75;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c76);
              }
            }

            if (s2 !== peg$FAILED) {
              s3 = peg$parsetime_with_offset();

              if (s3 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c80(s1, s3);
                s0 = s1;
              } else {
                peg$currPos = s0;
                s0 = peg$c2;
              }
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseS() {
        var s0;
        var key = peg$currPos * 49 + 39,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        if (peg$c81.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c82);
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseNL() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 40,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        if (input.charCodeAt(peg$currPos) === 10) {
          s0 = peg$c83;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c84);
          }
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 13) {
            s1 = peg$c85;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c86);
            }
          }

          if (s1 !== peg$FAILED) {
            if (input.charCodeAt(peg$currPos) === 10) {
              s2 = peg$c83;
              peg$currPos++;
            } else {
              s2 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c84);
              }
            }

            if (s2 !== peg$FAILED) {
              s1 = [s1, s2];
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseNLS() {
        var s0;
        var key = peg$currPos * 49 + 41,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$parseNL();

        if (s0 === peg$FAILED) {
          s0 = peg$parseS();
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseEOF() {
        var s0, s1;
        var key = peg$currPos * 49 + 42,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        peg$silentFails++;

        if (input.length > peg$currPos) {
          s1 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c6);
          }
        }

        peg$silentFails--;

        if (s1 === peg$FAILED) {
          s0 = peg$c5;
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseHEX() {
        var s0;
        var key = peg$currPos * 49 + 43,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        if (peg$c87.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c88);
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseDIGIT_OR_UNDER() {
        var s0, s1;
        var key = peg$currPos * 49 + 44,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        if (peg$c89.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c90);
          }
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.charCodeAt(peg$currPos) === 95) {
            s1 = peg$c91;
            peg$currPos++;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c92);
            }
          }

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c93();
          }

          s0 = s1;
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseASCII_BASIC() {
        var s0;
        var key = peg$currPos * 49 + 45,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        if (peg$c94.test(input.charAt(peg$currPos))) {
          s0 = input.charAt(peg$currPos);
          peg$currPos++;
        } else {
          s0 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c95);
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseDIGITS() {
        var s0, s1, s2;
        var key = peg$currPos * 49 + 46,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;
        s1 = [];
        s2 = peg$parseDIGIT_OR_UNDER();

        if (s2 !== peg$FAILED) {
          while (s2 !== peg$FAILED) {
            s1.push(s2);
            s2 = peg$parseDIGIT_OR_UNDER();
          }
        } else {
          s1 = peg$c2;
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c96(s1);
        }

        s0 = s1;
        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseESCAPED() {
        var s0, s1;
        var key = peg$currPos * 49 + 47,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.substr(peg$currPos, 2) === peg$c97) {
          s1 = peg$c97;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c98);
          }
        }

        if (s1 !== peg$FAILED) {
          peg$reportedPos = s0;
          s1 = peg$c99();
        }

        s0 = s1;

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.substr(peg$currPos, 2) === peg$c100) {
            s1 = peg$c100;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c101);
            }
          }

          if (s1 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c102();
          }

          s0 = s1;

          if (s0 === peg$FAILED) {
            s0 = peg$currPos;

            if (input.substr(peg$currPos, 2) === peg$c103) {
              s1 = peg$c103;
              peg$currPos += 2;
            } else {
              s1 = peg$FAILED;

              if (peg$silentFails === 0) {
                peg$fail(peg$c104);
              }
            }

            if (s1 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c105();
            }

            s0 = s1;

            if (s0 === peg$FAILED) {
              s0 = peg$currPos;

              if (input.substr(peg$currPos, 2) === peg$c106) {
                s1 = peg$c106;
                peg$currPos += 2;
              } else {
                s1 = peg$FAILED;

                if (peg$silentFails === 0) {
                  peg$fail(peg$c107);
                }
              }

              if (s1 !== peg$FAILED) {
                peg$reportedPos = s0;
                s1 = peg$c108();
              }

              s0 = s1;

              if (s0 === peg$FAILED) {
                s0 = peg$currPos;

                if (input.substr(peg$currPos, 2) === peg$c109) {
                  s1 = peg$c109;
                  peg$currPos += 2;
                } else {
                  s1 = peg$FAILED;

                  if (peg$silentFails === 0) {
                    peg$fail(peg$c110);
                  }
                }

                if (s1 !== peg$FAILED) {
                  peg$reportedPos = s0;
                  s1 = peg$c111();
                }

                s0 = s1;

                if (s0 === peg$FAILED) {
                  s0 = peg$currPos;

                  if (input.substr(peg$currPos, 2) === peg$c112) {
                    s1 = peg$c112;
                    peg$currPos += 2;
                  } else {
                    s1 = peg$FAILED;

                    if (peg$silentFails === 0) {
                      peg$fail(peg$c113);
                    }
                  }

                  if (s1 !== peg$FAILED) {
                    peg$reportedPos = s0;
                    s1 = peg$c114();
                  }

                  s0 = s1;

                  if (s0 === peg$FAILED) {
                    s0 = peg$currPos;

                    if (input.substr(peg$currPos, 2) === peg$c115) {
                      s1 = peg$c115;
                      peg$currPos += 2;
                    } else {
                      s1 = peg$FAILED;

                      if (peg$silentFails === 0) {
                        peg$fail(peg$c116);
                      }
                    }

                    if (s1 !== peg$FAILED) {
                      peg$reportedPos = s0;
                      s1 = peg$c117();
                    }

                    s0 = s1;

                    if (s0 === peg$FAILED) {
                      s0 = peg$parseESCAPED_UNICODE();
                    }
                  }
                }
              }
            }
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      function peg$parseESCAPED_UNICODE() {
        var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10;
        var key = peg$currPos * 49 + 48,
            cached = peg$cache[key];

        if (cached) {
          peg$currPos = cached.nextPos;
          return cached.result;
        }

        s0 = peg$currPos;

        if (input.substr(peg$currPos, 2) === peg$c118) {
          s1 = peg$c118;
          peg$currPos += 2;
        } else {
          s1 = peg$FAILED;

          if (peg$silentFails === 0) {
            peg$fail(peg$c119);
          }
        }

        if (s1 !== peg$FAILED) {
          s2 = peg$currPos;
          s3 = peg$parseHEX();

          if (s3 !== peg$FAILED) {
            s4 = peg$parseHEX();

            if (s4 !== peg$FAILED) {
              s5 = peg$parseHEX();

              if (s5 !== peg$FAILED) {
                s6 = peg$parseHEX();

                if (s6 !== peg$FAILED) {
                  s7 = peg$parseHEX();

                  if (s7 !== peg$FAILED) {
                    s8 = peg$parseHEX();

                    if (s8 !== peg$FAILED) {
                      s9 = peg$parseHEX();

                      if (s9 !== peg$FAILED) {
                        s10 = peg$parseHEX();

                        if (s10 !== peg$FAILED) {
                          s3 = [s3, s4, s5, s6, s7, s8, s9, s10];
                          s2 = s3;
                        } else {
                          peg$currPos = s2;
                          s2 = peg$c2;
                        }
                      } else {
                        peg$currPos = s2;
                        s2 = peg$c2;
                      }
                    } else {
                      peg$currPos = s2;
                      s2 = peg$c2;
                    }
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }
          } else {
            peg$currPos = s2;
            s2 = peg$c2;
          }

          if (s2 !== peg$FAILED) {
            peg$reportedPos = s0;
            s1 = peg$c120(s2);
            s0 = s1;
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$c2;
        }

        if (s0 === peg$FAILED) {
          s0 = peg$currPos;

          if (input.substr(peg$currPos, 2) === peg$c121) {
            s1 = peg$c121;
            peg$currPos += 2;
          } else {
            s1 = peg$FAILED;

            if (peg$silentFails === 0) {
              peg$fail(peg$c122);
            }
          }

          if (s1 !== peg$FAILED) {
            s2 = peg$currPos;
            s3 = peg$parseHEX();

            if (s3 !== peg$FAILED) {
              s4 = peg$parseHEX();

              if (s4 !== peg$FAILED) {
                s5 = peg$parseHEX();

                if (s5 !== peg$FAILED) {
                  s6 = peg$parseHEX();

                  if (s6 !== peg$FAILED) {
                    s3 = [s3, s4, s5, s6];
                    s2 = s3;
                  } else {
                    peg$currPos = s2;
                    s2 = peg$c2;
                  }
                } else {
                  peg$currPos = s2;
                  s2 = peg$c2;
                }
              } else {
                peg$currPos = s2;
                s2 = peg$c2;
              }
            } else {
              peg$currPos = s2;
              s2 = peg$c2;
            }

            if (s2 !== peg$FAILED) {
              peg$reportedPos = s0;
              s1 = peg$c120(s2);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$c2;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$c2;
          }
        }

        peg$cache[key] = {
          nextPos: peg$currPos,
          result: s0
        };
        return s0;
      }

      var nodes = [];

      function genError(err, line, col) {
        var ex = new Error(err);
        ex.line = line;
        ex.column = col;
        throw ex;
      }

      function addNode(node) {
        nodes.push(node);
      }

      function node(type, value, line, column, key) {
        var obj = {
          type: type,
          value: value,
          line: line(),
          column: column()
        };
        if (key) obj.key = key;
        return obj;
      }

      function convertCodePoint(str, line, col) {
        var num = parseInt("0x" + str);

        if (!isFinite(num) || Math.floor(num) != num || num < 0 || num > 0x10FFFF || num > 0xD7FF && num < 0xE000) {
          genError("Invalid Unicode escape code: " + str, line, col);
        } else {
          return fromCodePoint(num);
        }
      }

      function fromCodePoint() {
        var MAX_SIZE = 0x4000;
        var codeUnits = [];
        var highSurrogate;
        var lowSurrogate;
        var index = -1;
        var length = arguments.length;

        if (!length) {
          return '';
        }

        var result = '';

        while (++index < length) {
          var codePoint = Number(arguments[index]);

          if (codePoint <= 0xFFFF) {
            // BMP code point
            codeUnits.push(codePoint);
          } else {
            // Astral code point; split in surrogate halves
            // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
            codePoint -= 0x10000;
            highSurrogate = (codePoint >> 10) + 0xD800;
            lowSurrogate = codePoint % 0x400 + 0xDC00;
            codeUnits.push(highSurrogate, lowSurrogate);
          }

          if (index + 1 == length || codeUnits.length > MAX_SIZE) {
            result += String.fromCharCode.apply(null, codeUnits);
            codeUnits.length = 0;
          }
        }

        return result;
      }

      peg$result = peg$startRuleFunction();

      if (peg$result !== peg$FAILED && peg$currPos === input.length) {
        return peg$result;
      } else {
        if (peg$result !== peg$FAILED && peg$currPos < input.length) {
          peg$fail({
            type: "end",
            description: "end of input"
          });
        }

        throw peg$buildException(null, peg$maxFailExpected, peg$maxFailPos);
      }
    }

    return {
      SyntaxError: SyntaxError,
      parse: parse
    };
  }();

  function compile(nodes) {
    var assignedPaths = [];
    var valueAssignments = [];
    var currentPath = "";
    var data = Object.create(null);
    var context = data;
    return reduce(nodes);

    function reduce(nodes) {
      var node;

      for (var i = 0; i < nodes.length; i++) {
        node = nodes[i];

        switch (node.type) {
          case "Assign":
            assign(node);
            break;

          case "ObjectPath":
            setPath(node);
            break;

          case "ArrayPath":
            addTableArray(node);
            break;
        }
      }

      return data;
    }

    function genError(err, line, col) {
      var ex = new Error(err);
      ex.line = line;
      ex.column = col;
      throw ex;
    }

    function assign(node) {
      var key = node.key;
      var value = node.value;
      var line = node.line;
      var column = node.column;
      var fullPath;

      if (currentPath) {
        fullPath = currentPath + "." + key;
      } else {
        fullPath = key;
      }

      if (typeof context[key] !== "undefined") {
        genError("Cannot redefine existing key '" + fullPath + "'.", line, column);
      }

      context[key] = reduceValueNode(value);

      if (!pathAssigned(fullPath)) {
        assignedPaths.push(fullPath);
        valueAssignments.push(fullPath);
      }
    }

    function pathAssigned(path) {
      return assignedPaths.indexOf(path) !== -1;
    }

    function reduceValueNode(node) {
      if (node.type === "Array") {
        return reduceArrayWithTypeChecking(node.value);
      } else if (node.type === "InlineTable") {
        return reduceInlineTableNode(node.value);
      } else {
        return node.value;
      }
    }

    function reduceInlineTableNode(values) {
      var obj = Object.create(null);

      for (var i = 0; i < values.length; i++) {
        var val = values[i];

        if (val.value.type === "InlineTable") {
          obj[val.key] = reduceInlineTableNode(val.value.value);
        } else if (val.type === "InlineTableValue") {
          obj[val.key] = reduceValueNode(val.value);
        }
      }

      return obj;
    }

    function setPath(node) {
      var path = node.value;
      var quotedPath = path.map(quoteDottedString).join(".");
      var line = node.line;
      var column = node.column;

      if (pathAssigned(quotedPath)) {
        genError("Cannot redefine existing key '" + path + "'.", line, column);
      }

      assignedPaths.push(quotedPath);
      context = deepRef(data, path, Object.create(null), line, column);
      currentPath = path;
    }

    function addTableArray(node) {
      var path = node.value;
      var quotedPath = path.map(quoteDottedString).join(".");
      var line = node.line;
      var column = node.column;

      if (!pathAssigned(quotedPath)) {
        assignedPaths.push(quotedPath);
      }

      assignedPaths = assignedPaths.filter(function (p) {
        return p.indexOf(quotedPath) !== 0;
      });
      assignedPaths.push(quotedPath);
      context = deepRef(data, path, [], line, column);
      currentPath = quotedPath;

      if (context instanceof Array) {
        var newObj = Object.create(null);
        context.push(newObj);
        context = newObj;
      } else {
        genError("Cannot redefine existing key '" + path + "'.", line, column);
      }
    } // Given a path 'a.b.c', create (as necessary) `start.a`,
    // `start.a.b`, and `start.a.b.c`, assigning `value` to `start.a.b.c`.
    // If `a` or `b` are arrays and have items in them, the last item in the
    // array is used as the context for the next sub-path.


    function deepRef(start, keys, value, line, column) {
      var traversed = [];
      var traversedPath = "";
      keys.join(".");
      var ctx = start;

      for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        traversed.push(key);
        traversedPath = traversed.join(".");

        if (typeof ctx[key] === "undefined") {
          if (i === keys.length - 1) {
            ctx[key] = value;
          } else {
            ctx[key] = Object.create(null);
          }
        } else if (i !== keys.length - 1 && valueAssignments.indexOf(traversedPath) > -1) {
          // already a non-object value at key, can't be used as part of a new path
          genError("Cannot redefine existing key '" + traversedPath + "'.", line, column);
        }

        ctx = ctx[key];

        if (ctx instanceof Array && ctx.length && i < keys.length - 1) {
          ctx = ctx[ctx.length - 1];
        }
      }

      return ctx;
    }

    function reduceArrayWithTypeChecking(array) {
      // Ensure that all items in the array are of the same type
      var firstType = null;

      for (var i = 0; i < array.length; i++) {
        var node = array[i];

        if (firstType === null) {
          firstType = node.type;
        } else {
          if (node.type !== firstType) {
            genError("Cannot add value of type " + node.type + " to array of type " + firstType + ".", node.line, node.column);
          }
        }
      } // Recursively reduce array of nodes into array of the nodes' values


      return array.map(reduceValueNode);
    }

    function quoteDottedString(str) {
      if (str.indexOf(".") > -1) {
        return "\"" + str + "\"";
      } else {
        return str;
      }
    }
  }

  var compiler$1 = {
    compile: compile
  };

  var parser = parser$1;

  var compiler = compiler$1;

  var toml = {
    parse: function (input) {
      var nodes = parser.parse(input.toString());
      return compiler.compile(nodes);
    }
  };

  // This is a generated file. Do not edit.
  var Space_Separator = /[\u1680\u2000-\u200A\u202F\u205F\u3000]/;
  var ID_Start = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0980\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u09FC\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0AF9\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D\u0C58-\u0C5A\u0C60\u0C61\u0C80\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D54-\u0D56\u0D5F-\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u1884\u1887-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191E\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1C80-\u1C88\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA69D\uA6A0-\uA6EF\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA8FD\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uA9E0-\uA9E4\uA9E6-\uA9EF\uA9FA-\uA9FE\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA7E-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDE80-\uDE9C\uDEA0-\uDED0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF75\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00\uDE10-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE4\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC03-\uDC37\uDC83-\uDCAF\uDCD0-\uDCE8\uDD03-\uDD26\uDD50-\uDD72\uDD76\uDD83-\uDDB2\uDDC1-\uDDC4\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE2B\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEDE\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3D\uDF50\uDF5D-\uDF61]|\uD805[\uDC00-\uDC34\uDC47-\uDC4A\uDC80-\uDCAF\uDCC4\uDCC5\uDCC7\uDD80-\uDDAE\uDDD8-\uDDDB\uDE00-\uDE2F\uDE44\uDE80-\uDEAA\uDF00-\uDF19]|\uD806[\uDCA0-\uDCDF\uDCFF\uDE00\uDE0B-\uDE32\uDE3A\uDE50\uDE5C-\uDE83\uDE86-\uDE89\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC2E\uDC40\uDC72-\uDC8F\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD30\uDD46]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDED0-\uDEED\uDF00-\uDF2F\uDF40-\uDF43\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50\uDF93-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB]|\uD83A[\uDC00-\uDCC4\uDD00-\uDD43]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]/;
  var ID_Continue = /[\xAA\xB5\xBA\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u0487\u048A-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u0860-\u086A\u08A0-\u08B4\u08B6-\u08BD\u08D4-\u08E1\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09FC\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9-\u0AFF\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BEF\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C80-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D00-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D54-\u0D57\u0D5F-\u0D63\u0D66-\u0D6F\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F29\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19D9\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABD\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1C80-\u1C88\u1CD0-\u1CD2\u1CD4-\u1CF9\u1D00-\u1DF9\u1DFB-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u203F\u2040\u2054\u2071\u207F\u2090-\u209C\u20D0-\u20DC\u20E1\u20E5-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2160-\u2188\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312E\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FEA\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA66F\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AE\uA7B0-\uA7B7\uA7F7-\uA827\uA840-\uA873\uA880-\uA8C5\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE33\uFE34\uFE4D-\uFE4F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF3F\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD40-\uDD74\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0\uDF00-\uDF1F\uDF2D-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDCB0-\uDCD3\uDCD8-\uDCFB\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC60-\uDC76\uDC80-\uDC9E\uDCE0-\uDCF2\uDCF4\uDCF5\uDD00-\uDD15\uDD20-\uDD39\uDD80-\uDDB7\uDDBE\uDDBF\uDE00-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F\uDE60-\uDE7C\uDE80-\uDE9C\uDEC0-\uDEC7\uDEC9-\uDEE6\uDF00-\uDF35\uDF40-\uDF55\uDF60-\uDF72\uDF80-\uDF91]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2]|\uD804[\uDC00-\uDC46\uDC66-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDE00-\uDE11\uDE13-\uDE37\uDE3E\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC00-\uDC4A\uDC50-\uDC59\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF39]|\uD806[\uDCA0-\uDCE9\uDCFF\uDE00-\uDE3E\uDE47\uDE50-\uDE83\uDE86-\uDE99\uDEC0-\uDEF8]|\uD807[\uDC00-\uDC08\uDC0A-\uDC36\uDC38-\uDC40\uDC50-\uDC59\uDC72-\uDC8F\uDC92-\uDCA7\uDCA9-\uDCB6\uDD00-\uDD06\uDD08\uDD09\uDD0B-\uDD36\uDD3A\uDD3C\uDD3D\uDD3F-\uDD47\uDD50-\uDD59]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD81C-\uD820\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872\uD874-\uD879][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F\uDFE0\uDFE1]|\uD821[\uDC00-\uDFEC]|\uD822[\uDC00-\uDEF2]|\uD82C[\uDC00-\uDD1E\uDD70-\uDEFB]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD838[\uDC00-\uDC06\uDC08-\uDC18\uDC1B-\uDC21\uDC23\uDC24\uDC26-\uDC2A]|\uD83A[\uDC00-\uDCC4\uDCD0-\uDCD6\uDD00-\uDD4A\uDD50-\uDD59]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1\uDEB0-\uDFFF]|\uD87A[\uDC00-\uDFE0]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/;
  var unicode = {
    Space_Separator: Space_Separator,
    ID_Start: ID_Start,
    ID_Continue: ID_Continue
  };
  var util = {
    isSpaceSeparator(c) {
      return typeof c === 'string' && unicode.Space_Separator.test(c);
    },

    isIdStartChar(c) {
      return typeof c === 'string' && (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c === '$' || c === '_' || unicode.ID_Start.test(c));
    },

    isIdContinueChar(c) {
      return typeof c === 'string' && (c >= 'a' && c <= 'z' || c >= 'A' && c <= 'Z' || c >= '0' && c <= '9' || c === '$' || c === '_' || c === '\u200C' || c === '\u200D' || unicode.ID_Continue.test(c));
    },

    isDigit(c) {
      return typeof c === 'string' && /[0-9]/.test(c);
    },

    isHexDigit(c) {
      return typeof c === 'string' && /[0-9A-Fa-f]/.test(c);
    }

  };
  let source;
  let parseState;
  let stack;
  let pos;
  let line;
  let column;
  let token;
  let key;
  let root;

  var parse = function parse(text, reviver) {
    source = String(text);
    parseState = 'start';
    stack = [];
    pos = 0;
    line = 1;
    column = 0;
    token = undefined;
    key = undefined;
    root = undefined;

    do {
      token = lex(); // This code is unreachable.
      // if (!parseStates[parseState]) {
      //     throw invalidParseState()
      // }

      parseStates[parseState]();
    } while (token.type !== 'eof');

    if (typeof reviver === 'function') {
      return internalize({
        '': root
      }, '', reviver);
    }

    return root;
  };

  function internalize(holder, name, reviver) {
    const value = holder[name];

    if (value != null && typeof value === 'object') {
      for (const key in value) {
        const replacement = internalize(value, key, reviver);

        if (replacement === undefined) {
          delete value[key];
        } else {
          value[key] = replacement;
        }
      }
    }

    return reviver.call(holder, name, value);
  }

  let lexState;
  let buffer;
  let doubleQuote;
  let sign;
  let c;

  function lex() {
    lexState = 'default';
    buffer = '';
    doubleQuote = false;
    sign = 1;

    for (;;) {
      c = peek(); // This code is unreachable.
      // if (!lexStates[lexState]) {
      //     throw invalidLexState(lexState)
      // }

      const token = lexStates[lexState]();

      if (token) {
        return token;
      }
    }
  }

  function peek() {
    if (source[pos]) {
      return String.fromCodePoint(source.codePointAt(pos));
    }
  }

  function read() {
    const c = peek();

    if (c === '\n') {
      line++;
      column = 0;
    } else if (c) {
      column += c.length;
    } else {
      column++;
    }

    if (c) {
      pos += c.length;
    }

    return c;
  }

  const lexStates = {
    default() {
      switch (c) {
        case '\t':
        case '\v':
        case '\f':
        case ' ':
        case '\u00A0':
        case '\uFEFF':
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          read();
          return;

        case '/':
          read();
          lexState = 'comment';
          return;

        case undefined:
          read();
          return newToken('eof');
      }

      if (util.isSpaceSeparator(c)) {
        read();
        return;
      } // This code is unreachable.
      // if (!lexStates[parseState]) {
      //     throw invalidLexState(parseState)
      // }


      return lexStates[parseState]();
    },

    comment() {
      switch (c) {
        case '*':
          read();
          lexState = 'multiLineComment';
          return;

        case '/':
          read();
          lexState = 'singleLineComment';
          return;
      }

      throw invalidChar(read());
    },

    multiLineComment() {
      switch (c) {
        case '*':
          read();
          lexState = 'multiLineCommentAsterisk';
          return;

        case undefined:
          throw invalidChar(read());
      }

      read();
    },

    multiLineCommentAsterisk() {
      switch (c) {
        case '*':
          read();
          return;

        case '/':
          read();
          lexState = 'default';
          return;

        case undefined:
          throw invalidChar(read());
      }

      read();
      lexState = 'multiLineComment';
    },

    singleLineComment() {
      switch (c) {
        case '\n':
        case '\r':
        case '\u2028':
        case '\u2029':
          read();
          lexState = 'default';
          return;

        case undefined:
          read();
          return newToken('eof');
      }

      read();
    },

    value() {
      switch (c) {
        case '{':
        case '[':
          return newToken('punctuator', read());

        case 'n':
          read();
          literal('ull');
          return newToken('null', null);

        case 't':
          read();
          literal('rue');
          return newToken('boolean', true);

        case 'f':
          read();
          literal('alse');
          return newToken('boolean', false);

        case '-':
        case '+':
          if (read() === '-') {
            sign = -1;
          }

          lexState = 'sign';
          return;

        case '.':
          buffer = read();
          lexState = 'decimalPointLeading';
          return;

        case '0':
          buffer = read();
          lexState = 'zero';
          return;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          buffer = read();
          lexState = 'decimalInteger';
          return;

        case 'I':
          read();
          literal('nfinity');
          return newToken('numeric', Infinity);

        case 'N':
          read();
          literal('aN');
          return newToken('numeric', NaN);

        case '"':
        case "'":
          doubleQuote = read() === '"';
          buffer = '';
          lexState = 'string';
          return;
      }

      throw invalidChar(read());
    },

    identifierNameStartEscape() {
      if (c !== 'u') {
        throw invalidChar(read());
      }

      read();
      const u = unicodeEscape();

      switch (u) {
        case '$':
        case '_':
          break;

        default:
          if (!util.isIdStartChar(u)) {
            throw invalidIdentifier();
          }

          break;
      }

      buffer += u;
      lexState = 'identifierName';
    },

    identifierName() {
      switch (c) {
        case '$':
        case '_':
        case '\u200C':
        case '\u200D':
          buffer += read();
          return;

        case '\\':
          read();
          lexState = 'identifierNameEscape';
          return;
      }

      if (util.isIdContinueChar(c)) {
        buffer += read();
        return;
      }

      return newToken('identifier', buffer);
    },

    identifierNameEscape() {
      if (c !== 'u') {
        throw invalidChar(read());
      }

      read();
      const u = unicodeEscape();

      switch (u) {
        case '$':
        case '_':
        case '\u200C':
        case '\u200D':
          break;

        default:
          if (!util.isIdContinueChar(u)) {
            throw invalidIdentifier();
          }

          break;
      }

      buffer += u;
      lexState = 'identifierName';
    },

    sign() {
      switch (c) {
        case '.':
          buffer = read();
          lexState = 'decimalPointLeading';
          return;

        case '0':
          buffer = read();
          lexState = 'zero';
          return;

        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          buffer = read();
          lexState = 'decimalInteger';
          return;

        case 'I':
          read();
          literal('nfinity');
          return newToken('numeric', sign * Infinity);

        case 'N':
          read();
          literal('aN');
          return newToken('numeric', NaN);
      }

      throw invalidChar(read());
    },

    zero() {
      switch (c) {
        case '.':
          buffer += read();
          lexState = 'decimalPoint';
          return;

        case 'e':
        case 'E':
          buffer += read();
          lexState = 'decimalExponent';
          return;

        case 'x':
        case 'X':
          buffer += read();
          lexState = 'hexadecimal';
          return;
      }

      return newToken('numeric', sign * 0);
    },

    decimalInteger() {
      switch (c) {
        case '.':
          buffer += read();
          lexState = 'decimalPoint';
          return;

        case 'e':
        case 'E':
          buffer += read();
          lexState = 'decimalExponent';
          return;
      }

      if (util.isDigit(c)) {
        buffer += read();
        return;
      }

      return newToken('numeric', sign * Number(buffer));
    },

    decimalPointLeading() {
      if (util.isDigit(c)) {
        buffer += read();
        lexState = 'decimalFraction';
        return;
      }

      throw invalidChar(read());
    },

    decimalPoint() {
      switch (c) {
        case 'e':
        case 'E':
          buffer += read();
          lexState = 'decimalExponent';
          return;
      }

      if (util.isDigit(c)) {
        buffer += read();
        lexState = 'decimalFraction';
        return;
      }

      return newToken('numeric', sign * Number(buffer));
    },

    decimalFraction() {
      switch (c) {
        case 'e':
        case 'E':
          buffer += read();
          lexState = 'decimalExponent';
          return;
      }

      if (util.isDigit(c)) {
        buffer += read();
        return;
      }

      return newToken('numeric', sign * Number(buffer));
    },

    decimalExponent() {
      switch (c) {
        case '+':
        case '-':
          buffer += read();
          lexState = 'decimalExponentSign';
          return;
      }

      if (util.isDigit(c)) {
        buffer += read();
        lexState = 'decimalExponentInteger';
        return;
      }

      throw invalidChar(read());
    },

    decimalExponentSign() {
      if (util.isDigit(c)) {
        buffer += read();
        lexState = 'decimalExponentInteger';
        return;
      }

      throw invalidChar(read());
    },

    decimalExponentInteger() {
      if (util.isDigit(c)) {
        buffer += read();
        return;
      }

      return newToken('numeric', sign * Number(buffer));
    },

    hexadecimal() {
      if (util.isHexDigit(c)) {
        buffer += read();
        lexState = 'hexadecimalInteger';
        return;
      }

      throw invalidChar(read());
    },

    hexadecimalInteger() {
      if (util.isHexDigit(c)) {
        buffer += read();
        return;
      }

      return newToken('numeric', sign * Number(buffer));
    },

    string() {
      switch (c) {
        case '\\':
          read();
          buffer += escape();
          return;

        case '"':
          if (doubleQuote) {
            read();
            return newToken('string', buffer);
          }

          buffer += read();
          return;

        case "'":
          if (!doubleQuote) {
            read();
            return newToken('string', buffer);
          }

          buffer += read();
          return;

        case '\n':
        case '\r':
          throw invalidChar(read());

        case '\u2028':
        case '\u2029':
          separatorChar(c);
          break;

        case undefined:
          throw invalidChar(read());
      }

      buffer += read();
    },

    start() {
      switch (c) {
        case '{':
        case '[':
          return newToken('punctuator', read());
        // This code is unreachable since the default lexState handles eof.
        // case undefined:
        //     return newToken('eof')
      }

      lexState = 'value';
    },

    beforePropertyName() {
      switch (c) {
        case '$':
        case '_':
          buffer = read();
          lexState = 'identifierName';
          return;

        case '\\':
          read();
          lexState = 'identifierNameStartEscape';
          return;

        case '}':
          return newToken('punctuator', read());

        case '"':
        case "'":
          doubleQuote = read() === '"';
          lexState = 'string';
          return;
      }

      if (util.isIdStartChar(c)) {
        buffer += read();
        lexState = 'identifierName';
        return;
      }

      throw invalidChar(read());
    },

    afterPropertyName() {
      if (c === ':') {
        return newToken('punctuator', read());
      }

      throw invalidChar(read());
    },

    beforePropertyValue() {
      lexState = 'value';
    },

    afterPropertyValue() {
      switch (c) {
        case ',':
        case '}':
          return newToken('punctuator', read());
      }

      throw invalidChar(read());
    },

    beforeArrayValue() {
      if (c === ']') {
        return newToken('punctuator', read());
      }

      lexState = 'value';
    },

    afterArrayValue() {
      switch (c) {
        case ',':
        case ']':
          return newToken('punctuator', read());
      }

      throw invalidChar(read());
    },

    end() {
      // This code is unreachable since it's handled by the default lexState.
      // if (c === undefined) {
      //     read()
      //     return newToken('eof')
      // }
      throw invalidChar(read());
    }

  };

  function newToken(type, value) {
    return {
      type,
      value,
      line,
      column
    };
  }

  function literal(s) {
    for (const c of s) {
      const p = peek();

      if (p !== c) {
        throw invalidChar(read());
      }

      read();
    }
  }

  function escape() {
    const c = peek();

    switch (c) {
      case 'b':
        read();
        return '\b';

      case 'f':
        read();
        return '\f';

      case 'n':
        read();
        return '\n';

      case 'r':
        read();
        return '\r';

      case 't':
        read();
        return '\t';

      case 'v':
        read();
        return '\v';

      case '0':
        read();

        if (util.isDigit(peek())) {
          throw invalidChar(read());
        }

        return '\0';

      case 'x':
        read();
        return hexEscape();

      case 'u':
        read();
        return unicodeEscape();

      case '\n':
      case '\u2028':
      case '\u2029':
        read();
        return '';

      case '\r':
        read();

        if (peek() === '\n') {
          read();
        }

        return '';

      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        throw invalidChar(read());

      case undefined:
        throw invalidChar(read());
    }

    return read();
  }

  function hexEscape() {
    let buffer = '';
    let c = peek();

    if (!util.isHexDigit(c)) {
      throw invalidChar(read());
    }

    buffer += read();
    c = peek();

    if (!util.isHexDigit(c)) {
      throw invalidChar(read());
    }

    buffer += read();
    return String.fromCodePoint(parseInt(buffer, 16));
  }

  function unicodeEscape() {
    let buffer = '';
    let count = 4;

    while (count-- > 0) {
      const c = peek();

      if (!util.isHexDigit(c)) {
        throw invalidChar(read());
      }

      buffer += read();
    }

    return String.fromCodePoint(parseInt(buffer, 16));
  }

  const parseStates = {
    start() {
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      push();
    },

    beforePropertyName() {
      switch (token.type) {
        case 'identifier':
        case 'string':
          key = token.value;
          parseState = 'afterPropertyName';
          return;

        case 'punctuator':
          // This code is unreachable since it's handled by the lexState.
          // if (token.value !== '}') {
          //     throw invalidToken()
          // }
          pop();
          return;

        case 'eof':
          throw invalidEOF();
      } // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()

    },

    afterPropertyName() {
      // This code is unreachable since it's handled by the lexState.
      // if (token.type !== 'punctuator' || token.value !== ':') {
      //     throw invalidToken()
      // }
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      parseState = 'beforePropertyValue';
    },

    beforePropertyValue() {
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      push();
    },

    beforeArrayValue() {
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      if (token.type === 'punctuator' && token.value === ']') {
        pop();
        return;
      }

      push();
    },

    afterPropertyValue() {
      // This code is unreachable since it's handled by the lexState.
      // if (token.type !== 'punctuator') {
      //     throw invalidToken()
      // }
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      switch (token.value) {
        case ',':
          parseState = 'beforePropertyName';
          return;

        case '}':
          pop();
      } // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()

    },

    afterArrayValue() {
      // This code is unreachable since it's handled by the lexState.
      // if (token.type !== 'punctuator') {
      //     throw invalidToken()
      // }
      if (token.type === 'eof') {
        throw invalidEOF();
      }

      switch (token.value) {
        case ',':
          parseState = 'beforeArrayValue';
          return;

        case ']':
          pop();
      } // This code is unreachable since it's handled by the lexState.
      // throw invalidToken()

    },

    end() {// This code is unreachable since it's handled by the lexState.
      // if (token.type !== 'eof') {
      //     throw invalidToken()
      // }
    }

  };

  function push() {
    let value;

    switch (token.type) {
      case 'punctuator':
        switch (token.value) {
          case '{':
            value = {};
            break;

          case '[':
            value = [];
            break;
        }

        break;

      case 'null':
      case 'boolean':
      case 'numeric':
      case 'string':
        value = token.value;
        break;
      // This code is unreachable.
      // default:
      //     throw invalidToken()
    }

    if (root === undefined) {
      root = value;
    } else {
      const parent = stack[stack.length - 1];

      if (Array.isArray(parent)) {
        parent.push(value);
      } else {
        parent[key] = value;
      }
    }

    if (value !== null && typeof value === 'object') {
      stack.push(value);

      if (Array.isArray(value)) {
        parseState = 'beforeArrayValue';
      } else {
        parseState = 'beforePropertyName';
      }
    } else {
      const current = stack[stack.length - 1];

      if (current == null) {
        parseState = 'end';
      } else if (Array.isArray(current)) {
        parseState = 'afterArrayValue';
      } else {
        parseState = 'afterPropertyValue';
      }
    }
  }

  function pop() {
    stack.pop();
    const current = stack[stack.length - 1];

    if (current == null) {
      parseState = 'end';
    } else if (Array.isArray(current)) {
      parseState = 'afterArrayValue';
    } else {
      parseState = 'afterPropertyValue';
    }
  } // This code is unreachable.
  // function invalidParseState () {
  //     return new Error(`JSON5: invalid parse state '${parseState}'`)
  // }
  // This code is unreachable.
  // function invalidLexState (state) {
  //     return new Error(`JSON5: invalid lex state '${state}'`)
  // }


  function invalidChar(c) {
    if (c === undefined) {
      return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
    }

    return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`);
  }

  function invalidEOF() {
    return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
  } // This code is unreachable.
  // function invalidToken () {
  //     if (token.type === 'eof') {
  //         return syntaxError(`JSON5: invalid end of input at ${line}:${column}`)
  //     }
  //     const c = String.fromCodePoint(token.value.codePointAt(0))
  //     return syntaxError(`JSON5: invalid character '${formatChar(c)}' at ${line}:${column}`)
  // }


  function invalidIdentifier() {
    column -= 5;
    return syntaxError(`JSON5: invalid identifier character at ${line}:${column}`);
  }

  function separatorChar(c) {
    console.warn(`JSON5: '${formatChar(c)}' in strings is not valid ECMAScript; consider escaping`);
  }

  function formatChar(c) {
    const replacements = {
      "'": "\\'",
      '"': '\\"',
      '\\': '\\\\',
      '\b': '\\b',
      '\f': '\\f',
      '\n': '\\n',
      '\r': '\\r',
      '\t': '\\t',
      '\v': '\\v',
      '\0': '\\0',
      '\u2028': '\\u2028',
      '\u2029': '\\u2029'
    };

    if (replacements[c]) {
      return replacements[c];
    }

    if (c < ' ') {
      const hexString = c.charCodeAt(0).toString(16);
      return '\\x' + ('00' + hexString).substring(hexString.length);
    }

    return c;
  }

  function syntaxError(message) {
    const err = new SyntaxError(message);
    err.lineNumber = line;
    err.columnNumber = column;
    return err;
  }

  var stringify = function stringify(value, replacer, space) {
    const stack = [];
    let indent = '';
    let propertyList;
    let replacerFunc;
    let gap = '';
    let quote;

    if (replacer != null && typeof replacer === 'object' && !Array.isArray(replacer)) {
      space = replacer.space;
      quote = replacer.quote;
      replacer = replacer.replacer;
    }

    if (typeof replacer === 'function') {
      replacerFunc = replacer;
    } else if (Array.isArray(replacer)) {
      propertyList = [];

      for (const v of replacer) {
        let item;

        if (typeof v === 'string') {
          item = v;
        } else if (typeof v === 'number' || v instanceof String || v instanceof Number) {
          item = String(v);
        }

        if (item !== undefined && propertyList.indexOf(item) < 0) {
          propertyList.push(item);
        }
      }
    }

    if (space instanceof Number) {
      space = Number(space);
    } else if (space instanceof String) {
      space = String(space);
    }

    if (typeof space === 'number') {
      if (space > 0) {
        space = Math.min(10, Math.floor(space));
        gap = '          '.substr(0, space);
      }
    } else if (typeof space === 'string') {
      gap = space.substr(0, 10);
    }

    return serializeProperty('', {
      '': value
    });

    function serializeProperty(key, holder) {
      let value = holder[key];

      if (value != null) {
        if (typeof value.toJSON5 === 'function') {
          value = value.toJSON5(key);
        } else if (typeof value.toJSON === 'function') {
          value = value.toJSON(key);
        }
      }

      if (replacerFunc) {
        value = replacerFunc.call(holder, key, value);
      }

      if (value instanceof Number) {
        value = Number(value);
      } else if (value instanceof String) {
        value = String(value);
      } else if (value instanceof Boolean) {
        value = value.valueOf();
      }

      switch (value) {
        case null:
          return 'null';

        case true:
          return 'true';

        case false:
          return 'false';
      }

      if (typeof value === 'string') {
        return quoteString(value);
      }

      if (typeof value === 'number') {
        return String(value);
      }

      if (typeof value === 'object') {
        return Array.isArray(value) ? serializeArray(value) : serializeObject(value);
      }

      return undefined;
    }

    function quoteString(value) {
      const quotes = {
        "'": 0.1,
        '"': 0.2
      };
      const replacements = {
        "'": "\\'",
        '"': '\\"',
        '\\': '\\\\',
        '\b': '\\b',
        '\f': '\\f',
        '\n': '\\n',
        '\r': '\\r',
        '\t': '\\t',
        '\v': '\\v',
        '\0': '\\0',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029'
      };
      let product = '';

      for (let i = 0; i < value.length; i++) {
        const c = value[i];

        switch (c) {
          case "'":
          case '"':
            quotes[c]++;
            product += c;
            continue;

          case '\0':
            if (util.isDigit(value[i + 1])) {
              product += '\\x00';
              continue;
            }

        }

        if (replacements[c]) {
          product += replacements[c];
          continue;
        }

        if (c < ' ') {
          let hexString = c.charCodeAt(0).toString(16);
          product += '\\x' + ('00' + hexString).substring(hexString.length);
          continue;
        }

        product += c;
      }

      const quoteChar = quote || Object.keys(quotes).reduce((a, b) => quotes[a] < quotes[b] ? a : b);
      product = product.replace(new RegExp(quoteChar, 'g'), replacements[quoteChar]);
      return quoteChar + product + quoteChar;
    }

    function serializeObject(value) {
      if (stack.indexOf(value) >= 0) {
        throw TypeError('Converting circular structure to JSON5');
      }

      stack.push(value);
      let stepback = indent;
      indent = indent + gap;
      let keys = propertyList || Object.keys(value);
      let partial = [];

      for (const key of keys) {
        const propertyString = serializeProperty(key, value);

        if (propertyString !== undefined) {
          let member = serializeKey(key) + ':';

          if (gap !== '') {
            member += ' ';
          }

          member += propertyString;
          partial.push(member);
        }
      }

      let final;

      if (partial.length === 0) {
        final = '{}';
      } else {
        let properties;

        if (gap === '') {
          properties = partial.join(',');
          final = '{' + properties + '}';
        } else {
          let separator = ',\n' + indent;
          properties = partial.join(separator);
          final = '{\n' + indent + properties + ',\n' + stepback + '}';
        }
      }

      stack.pop();
      indent = stepback;
      return final;
    }

    function serializeKey(key) {
      if (key.length === 0) {
        return quoteString(key);
      }

      const firstChar = String.fromCodePoint(key.codePointAt(0));

      if (!util.isIdStartChar(firstChar)) {
        return quoteString(key);
      }

      for (let i = firstChar.length; i < key.length; i++) {
        if (!util.isIdContinueChar(String.fromCodePoint(key.codePointAt(i)))) {
          return quoteString(key);
        }
      }

      return key;
    }

    function serializeArray(value) {
      if (stack.indexOf(value) >= 0) {
        throw TypeError('Converting circular structure to JSON5');
      }

      stack.push(value);
      let stepback = indent;
      indent = indent + gap;
      let partial = [];

      for (let i = 0; i < value.length; i++) {
        const propertyString = serializeProperty(String(i), value);
        partial.push(propertyString !== undefined ? propertyString : 'null');
      }

      let final;

      if (partial.length === 0) {
        final = '[]';
      } else {
        if (gap === '') {
          let properties = partial.join(',');
          final = '[' + properties + ']';
        } else {
          let separator = ',\n' + indent;
          let properties = partial.join(separator);
          final = '[\n' + indent + properties + ',\n' + stepback + ']';
        }
      }

      stack.pop();
      indent = stepback;
      return final;
    }
  };

  const JSON5 = {
    parse,
    stringify
  };
  var lib = JSON5;

  /*! js-yaml 4.1.0 https://github.com/nodeca/js-yaml @license MIT */
  function isNothing(subject) {
    return typeof subject === 'undefined' || subject === null;
  }

  function isObject(subject) {
    return typeof subject === 'object' && subject !== null;
  }

  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];
    return [sequence];
  }

  function extend(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }

  function repeat(string, count) {
    var result = '',
        cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }

  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }

  var isNothing_1 = isNothing;
  var isObject_1 = isObject;
  var toArray_1 = toArray;
  var repeat_1 = repeat;
  var isNegativeZero_1 = isNegativeZero;
  var extend_1 = extend;
  var common = {
    isNothing: isNothing_1,
    isObject: isObject_1,
    toArray: toArray_1,
    repeat: repeat_1,
    isNegativeZero: isNegativeZero_1,
    extend: extend_1
  }; // YAML error class. http://stackoverflow.com/questions/8458984

  function formatError(exception, compact) {
    var where = '',
        message = exception.reason || '(unknown reason)';
    if (!exception.mark) return message;

    if (exception.mark.name) {
      where += 'in "' + exception.mark.name + '" ';
    }

    where += '(' + (exception.mark.line + 1) + ':' + (exception.mark.column + 1) + ')';

    if (!compact && exception.mark.snippet) {
      where += '\n\n' + exception.mark.snippet;
    }

    return message + ' ' + where;
  }

  function YAMLException$1(reason, mark) {
    // Super constructor
    Error.call(this);
    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = formatError(this, false); // Include stack trace in error object

    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = new Error().stack || '';
    }
  } // Inherit from Error


  YAMLException$1.prototype = Object.create(Error.prototype);
  YAMLException$1.prototype.constructor = YAMLException$1;

  YAMLException$1.prototype.toString = function toString(compact) {
    return this.name + ': ' + formatError(this, compact);
  };

  var exception = YAMLException$1; // get snippet for a single line, respecting maxLength

  function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
    var head = '';
    var tail = '';
    var maxHalfLength = Math.floor(maxLineLength / 2) - 1;

    if (position - lineStart > maxHalfLength) {
      head = ' ... ';
      lineStart = position - maxHalfLength + head.length;
    }

    if (lineEnd - position > maxHalfLength) {
      tail = ' ...';
      lineEnd = position + maxHalfLength - tail.length;
    }

    return {
      str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, '→') + tail,
      pos: position - lineStart + head.length // relative position

    };
  }

  function padStart(string, max) {
    return common.repeat(' ', max - string.length) + string;
  }

  function makeSnippet(mark, options) {
    options = Object.create(options || null);
    if (!mark.buffer) return null;
    if (!options.maxLength) options.maxLength = 79;
    if (typeof options.indent !== 'number') options.indent = 1;
    if (typeof options.linesBefore !== 'number') options.linesBefore = 3;
    if (typeof options.linesAfter !== 'number') options.linesAfter = 2;
    var re = /\r?\n|\r|\0/g;
    var lineStarts = [0];
    var lineEnds = [];
    var match;
    var foundLineNo = -1;

    while (match = re.exec(mark.buffer)) {
      lineEnds.push(match.index);
      lineStarts.push(match.index + match[0].length);

      if (mark.position <= match.index && foundLineNo < 0) {
        foundLineNo = lineStarts.length - 2;
      }
    }

    if (foundLineNo < 0) foundLineNo = lineStarts.length - 1;
    var result = '',
        i,
        line;
    var lineNoLength = Math.min(mark.line + options.linesAfter, lineEnds.length).toString().length;
    var maxLineLength = options.maxLength - (options.indent + lineNoLength + 3);

    for (i = 1; i <= options.linesBefore; i++) {
      if (foundLineNo - i < 0) break;
      line = getLine(mark.buffer, lineStarts[foundLineNo - i], lineEnds[foundLineNo - i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]), maxLineLength);
      result = common.repeat(' ', options.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n' + result;
    }

    line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
    result += common.repeat(' ', options.indent) + padStart((mark.line + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
    result += common.repeat('-', options.indent + lineNoLength + 3 + line.pos) + '^' + '\n';

    for (i = 1; i <= options.linesAfter; i++) {
      if (foundLineNo + i >= lineEnds.length) break;
      line = getLine(mark.buffer, lineStarts[foundLineNo + i], lineEnds[foundLineNo + i], mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]), maxLineLength);
      result += common.repeat(' ', options.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + ' | ' + line.str + '\n';
    }

    return result.replace(/\n$/, '');
  }

  var snippet = makeSnippet;
  var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'multi', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'representName', 'defaultStyle', 'styleAliases'];
  var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];

  function compileStyleAliases(map) {
    var result = {};

    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }

    return result;
  }

  function Type$1(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new exception('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    }); // TODO: Add tag format check.

    this.options = options; // keep original options in case user wants to extend this type later

    this.tag = tag;
    this.kind = options['kind'] || null;

    this.resolve = options['resolve'] || function () {
      return true;
    };

    this.construct = options['construct'] || function (data) {
      return data;
    };

    this.instanceOf = options['instanceOf'] || null;
    this.predicate = options['predicate'] || null;
    this.represent = options['represent'] || null;
    this.representName = options['representName'] || null;
    this.defaultStyle = options['defaultStyle'] || null;
    this.multi = options['multi'] || false;
    this.styleAliases = compileStyleAliases(options['styleAliases'] || null);

    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new exception('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }

  var type = Type$1;
  /*eslint-disable max-len*/

  function compileList(schema, name) {
    var result = [];
    schema[name].forEach(function (currentType) {
      var newIndex = result.length;
      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
          newIndex = previousIndex;
        }
      });
      result[newIndex] = currentType;
    });
    return result;
  }

  function compileMap()
  /* lists... */
  {
    var result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {},
      multi: {
        scalar: [],
        sequence: [],
        mapping: [],
        fallback: []
      }
    },
        index,
        length;

    function collectType(type) {
      if (type.multi) {
        result.multi[type.kind].push(type);
        result.multi['fallback'].push(type);
      } else {
        result[type.kind][type.tag] = result['fallback'][type.tag] = type;
      }
    }

    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }

    return result;
  }

  function Schema$1(definition) {
    return this.extend(definition);
  }

  Schema$1.prototype.extend = function extend(definition) {
    var implicit = [];
    var explicit = [];

    if (definition instanceof type) {
      // Schema.extend(type)
      explicit.push(definition);
    } else if (Array.isArray(definition)) {
      // Schema.extend([ type1, type2, ... ])
      explicit = explicit.concat(definition);
    } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
      // Schema.extend({ explicit: [ type1, type2, ... ], implicit: [ type1, type2, ... ] })
      if (definition.implicit) implicit = implicit.concat(definition.implicit);
      if (definition.explicit) explicit = explicit.concat(definition.explicit);
    } else {
      throw new exception('Schema.extend argument should be a Type, [ Type ], ' + 'or a schema definition ({ implicit: [...], explicit: [...] })');
    }

    implicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }

      if (type$1.loadKind && type$1.loadKind !== 'scalar') {
        throw new exception('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }

      if (type$1.multi) {
        throw new exception('There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.');
      }
    });
    explicit.forEach(function (type$1) {
      if (!(type$1 instanceof type)) {
        throw new exception('Specified list of YAML types (or a single Type object) contains a non-Type object.');
      }
    });
    var result = Object.create(Schema$1.prototype);
    result.implicit = (this.implicit || []).concat(implicit);
    result.explicit = (this.explicit || []).concat(explicit);
    result.compiledImplicit = compileList(result, 'implicit');
    result.compiledExplicit = compileList(result, 'explicit');
    result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
    return result;
  };

  var schema = Schema$1;
  var str = new type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) {
      return data !== null ? data : '';
    }
  });
  var seq = new type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) {
      return data !== null ? data : [];
    }
  });
  var map = new type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) {
      return data !== null ? data : {};
    }
  });
  var failsafe = new schema({
    explicit: [str, seq, map]
  });

  function resolveYamlNull(data) {
    if (data === null) return true;
    var max = data.length;
    return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
  }

  function constructYamlNull() {
    return null;
  }

  function isNull(object) {
    return object === null;
  }

  var _null = new type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () {
        return '~';
      },
      lowercase: function () {
        return 'null';
      },
      uppercase: function () {
        return 'NULL';
      },
      camelcase: function () {
        return 'Null';
      },
      empty: function () {
        return '';
      }
    },
    defaultStyle: 'lowercase'
  });

  function resolveYamlBoolean(data) {
    if (data === null) return false;
    var max = data.length;
    return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
  }

  function constructYamlBoolean(data) {
    return data === 'true' || data === 'True' || data === 'TRUE';
  }

  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }

  var bool = new type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) {
        return object ? 'true' : 'false';
      },
      uppercase: function (object) {
        return object ? 'TRUE' : 'FALSE';
      },
      camelcase: function (object) {
        return object ? 'True' : 'False';
      }
    },
    defaultStyle: 'lowercase'
  });

  function isHexCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    || 0x41
    /* A */
    <= c && c <= 0x46
    /* F */
    || 0x61
    /* a */
    <= c && c <= 0x66
    /* f */
    ;
  }

  function isOctCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x37
    /* 7 */
    ;
  }

  function isDecCode(c) {
    return 0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ;
  }

  function resolveYamlInteger(data) {
    if (data === null) return false;
    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;
    if (!max) return false;
    ch = data[index]; // sign

    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }

    if (ch === '0') {
      // 0
      if (index + 1 === max) return true;
      ch = data[++index]; // base 2, base 8, base 16

      if (ch === 'b') {
        // base 2
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }

      if (ch === 'x') {
        // base 16
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }

      if (ch === 'o') {
        // base 8
        index++;

        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isOctCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }

        return hasDigits && ch !== '_';
      }
    } // base 10 (except 0)
    // value should not start with `_`;


    if (ch === '_') return false;

    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;

      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }

      hasDigits = true;
    } // Should have digits and should not end with `_`


    if (!hasDigits || ch === '_') return false;
    return true;
  }

  function constructYamlInteger(data) {
    var value = data,
        sign = 1,
        ch;

    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }

    ch = value[0];

    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }

    if (value === '0') return 0;

    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value.slice(2), 16);
      if (value[1] === 'o') return sign * parseInt(value.slice(2), 8);
    }

    return sign * parseInt(value, 10);
  }

  function isInteger(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
  }

  var int = new type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function (obj) {
        return obj >= 0 ? '0b' + obj.toString(2) : '-0b' + obj.toString(2).slice(1);
      },
      octal: function (obj) {
        return obj >= 0 ? '0o' + obj.toString(8) : '-0o' + obj.toString(8).slice(1);
      },
      decimal: function (obj) {
        return obj.toString(10);
      },

      /* eslint-disable max-len */
      hexadecimal: function (obj) {
        return obj >= 0 ? '0x' + obj.toString(16).toUpperCase() : '-0x' + obj.toString(16).toUpperCase().slice(1);
      }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary: [2, 'bin'],
      octal: [8, 'oct'],
      decimal: [10, 'dec'],
      hexadecimal: [16, 'hex']
    }
  });
  var YAML_FLOAT_PATTERN = new RegExp( // 2.5e4, 2.5 and integers
  '^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' + // .2e4, .2
  // special case, seems not from spec
  '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' + // .inf
  '|[-+]?\\.(?:inf|Inf|INF)' + // .nan
  '|\\.(?:nan|NaN|NAN))$');

  function resolveYamlFloat(data) {
    if (data === null) return false;

    if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    data[data.length - 1] === '_') {
      return false;
    }

    return true;
  }

  function constructYamlFloat(data) {
    var value, sign;
    value = data.replace(/_/g, '').toLowerCase();
    sign = value[0] === '-' ? -1 : 1;

    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }

    if (value === '.inf') {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === '.nan') {
      return NaN;
    }

    return sign * parseFloat(value, 10);
  }

  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;

  function representYamlFloat(object, style) {
    var res;

    if (isNaN(object)) {
      switch (style) {
        case 'lowercase':
          return '.nan';

        case 'uppercase':
          return '.NAN';

        case 'camelcase':
          return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '.inf';

        case 'uppercase':
          return '.INF';

        case 'camelcase':
          return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '-.inf';

        case 'uppercase':
          return '-.INF';

        case 'camelcase':
          return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }

    res = object.toString(10); // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requres dot: 5.e-100. Fix it with simple hack

    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }

  function isFloat(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
  }

  var float = new type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });
  var json = failsafe.extend({
    implicit: [_null, bool, int, float]
  });
  var core = json;
  var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9])' + // [2] month
  '-([0-9][0-9])$'); // [3] day

  var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + // [1] year
  '-([0-9][0-9]?)' + // [2] month
  '-([0-9][0-9]?)' + // [3] day
  '(?:[Tt]|[ \\t]+)' + // ...
  '([0-9][0-9]?)' + // [4] hour
  ':([0-9][0-9])' + // [5] minute
  ':([0-9][0-9])' + // [6] second
  '(?:\\.([0-9]*))?' + // [7] fraction
  '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + // [8] tz [9] tz_sign [10] tz_hour
  '(?::([0-9][0-9]))?))?$'); // [11] tz_minute

  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }

  function constructYamlTimestamp(data) {
    var match,
        year,
        month,
        day,
        hour,
        minute,
        second,
        fraction = 0,
        delta = null,
        tz_hour,
        tz_minute,
        date;
    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error('Date resolve error'); // match: [1] year [2] month [3] day

    year = +match[1];
    month = +match[2] - 1; // JS month starts with 0

    day = +match[3];

    if (!match[4]) {
      // no hour
      return new Date(Date.UTC(year, month, day));
    } // match: [4] hour [5] minute [6] second [7] fraction


    hour = +match[4];
    minute = +match[5];
    second = +match[6];

    if (match[7]) {
      fraction = match[7].slice(0, 3);

      while (fraction.length < 3) {
        // milli-seconds
        fraction += '0';
      }

      fraction = +fraction;
    } // match: [8] tz [9] tz_sign [10] tz_hour [11] tz_minute


    if (match[9]) {
      tz_hour = +match[10];
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000; // delta in mili-seconds

      if (match[9] === '-') delta = -delta;
    }

    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }

  function representYamlTimestamp(object
  /*, style*/
  ) {
    return object.toISOString();
  }

  var timestamp = new type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });

  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }

  var merge = new type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });
  /*eslint-disable no-bitwise*/
  // [ 64, 65, 66 ] -> [ padding, CR, LF ]

  var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';

  function resolveYamlBinary(data) {
    if (data === null) return false;
    var code,
        idx,
        bitlen = 0,
        max = data.length,
        map = BASE64_MAP; // Convert one by one.

    for (idx = 0; idx < max; idx++) {
      code = map.indexOf(data.charAt(idx)); // Skip CR/LF

      if (code > 64) continue; // Fail on illegal characters

      if (code < 0) return false;
      bitlen += 6;
    } // If there are any bits left, source was corrupted


    return bitlen % 8 === 0;
  }

  function constructYamlBinary(data) {
    var idx,
        tailbits,
        input = data.replace(/[\r\n=]/g, ''),
        // remove CR/LF & padding to simplify scan
    max = input.length,
        map = BASE64_MAP,
        bits = 0,
        result = []; // Collect by 6*4 bits (3 bytes)

    for (idx = 0; idx < max; idx++) {
      if (idx % 4 === 0 && idx) {
        result.push(bits >> 16 & 0xFF);
        result.push(bits >> 8 & 0xFF);
        result.push(bits & 0xFF);
      }

      bits = bits << 6 | map.indexOf(input.charAt(idx));
    } // Dump tail


    tailbits = max % 4 * 6;

    if (tailbits === 0) {
      result.push(bits >> 16 & 0xFF);
      result.push(bits >> 8 & 0xFF);
      result.push(bits & 0xFF);
    } else if (tailbits === 18) {
      result.push(bits >> 10 & 0xFF);
      result.push(bits >> 2 & 0xFF);
    } else if (tailbits === 12) {
      result.push(bits >> 4 & 0xFF);
    }

    return new Uint8Array(result);
  }

  function representYamlBinary(object
  /*, style*/
  ) {
    var result = '',
        bits = 0,
        idx,
        tail,
        max = object.length,
        map = BASE64_MAP; // Convert every three bytes to 4 ASCII characters.

    for (idx = 0; idx < max; idx++) {
      if (idx % 3 === 0 && idx) {
        result += map[bits >> 18 & 0x3F];
        result += map[bits >> 12 & 0x3F];
        result += map[bits >> 6 & 0x3F];
        result += map[bits & 0x3F];
      }

      bits = (bits << 8) + object[idx];
    } // Dump tail


    tail = max % 3;

    if (tail === 0) {
      result += map[bits >> 18 & 0x3F];
      result += map[bits >> 12 & 0x3F];
      result += map[bits >> 6 & 0x3F];
      result += map[bits & 0x3F];
    } else if (tail === 2) {
      result += map[bits >> 10 & 0x3F];
      result += map[bits >> 4 & 0x3F];
      result += map[bits << 2 & 0x3F];
      result += map[64];
    } else if (tail === 1) {
      result += map[bits >> 2 & 0x3F];
      result += map[bits << 4 & 0x3F];
      result += map[64];
      result += map[64];
    }

    return result;
  }

  function isBinary(obj) {
    return Object.prototype.toString.call(obj) === '[object Uint8Array]';
  }

  var binary = new type('tag:yaml.org,2002:binary', {
    kind: 'scalar',
    resolve: resolveYamlBinary,
    construct: constructYamlBinary,
    predicate: isBinary,
    represent: representYamlBinary
  });
  var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
  var _toString$2 = Object.prototype.toString;

  function resolveYamlOmap(data) {
    if (data === null) return true;
    var objectKeys = [],
        index,
        length,
        pair,
        pairKey,
        pairHasKey,
        object = data;

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;
      if (_toString$2.call(pair) !== '[object Object]') return false;

      for (pairKey in pair) {
        if (_hasOwnProperty$3.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;else return false;
        }
      }

      if (!pairHasKey) return false;
      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
    }

    return true;
  }

  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }

  var omap = new type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
  var _toString$1 = Object.prototype.toString;

  function resolveYamlPairs(data) {
    if (data === null) return true;
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      if (_toString$1.call(pair) !== '[object Object]') return false;
      keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }

    return true;
  }

  function constructYamlPairs(data) {
    if (data === null) return [];
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);

    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }

    return result;
  }

  var pairs = new type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
  var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;

  function resolveYamlSet(data) {
    if (data === null) return true;
    var key,
        object = data;

    for (key in object) {
      if (_hasOwnProperty$2.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }

    return true;
  }

  function constructYamlSet(data) {
    return data !== null ? data : {};
  }

  var set = new type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });

  var _default = core.extend({
    implicit: [timestamp, merge],
    explicit: [binary, omap, pairs, set]
  });
  /*eslint-disable max-len,no-use-before-define*/


  var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;

  function _class(obj) {
    return Object.prototype.toString.call(obj);
  }

  function is_EOL(c) {
    return c === 0x0A
    /* LF */
    || c === 0x0D
    /* CR */
    ;
  }

  function is_WHITE_SPACE(c) {
    return c === 0x09
    /* Tab */
    || c === 0x20
    /* Space */
    ;
  }

  function is_WS_OR_EOL(c) {
    return c === 0x09
    /* Tab */
    || c === 0x20
    /* Space */
    || c === 0x0A
    /* LF */
    || c === 0x0D
    /* CR */
    ;
  }

  function is_FLOW_INDICATOR(c) {
    return c === 0x2C
    /* , */
    || c === 0x5B
    /* [ */
    || c === 0x5D
    /* ] */
    || c === 0x7B
    /* { */
    || c === 0x7D
    /* } */
    ;
  }

  function fromHexCode(c) {
    var lc;

    if (0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ) {
      return c - 0x30;
    }
    /*eslint-disable no-bitwise*/


    lc = c | 0x20;

    if (0x61
    /* a */
    <= lc && lc <= 0x66
    /* f */
    ) {
      return lc - 0x61 + 10;
    }

    return -1;
  }

  function escapedHexLen(c) {
    if (c === 0x78
    /* x */
    ) {
        return 2;
      }

    if (c === 0x75
    /* u */
    ) {
        return 4;
      }

    if (c === 0x55
    /* U */
    ) {
        return 8;
      }

    return 0;
  }

  function fromDecimalCode(c) {
    if (0x30
    /* 0 */
    <= c && c <= 0x39
    /* 9 */
    ) {
      return c - 0x30;
    }

    return -1;
  }

  function simpleEscapeSequence(c) {
    /* eslint-disable indent */
    return c === 0x30
    /* 0 */
    ? '\x00' : c === 0x61
    /* a */
    ? '\x07' : c === 0x62
    /* b */
    ? '\x08' : c === 0x74
    /* t */
    ? '\x09' : c === 0x09
    /* Tab */
    ? '\x09' : c === 0x6E
    /* n */
    ? '\x0A' : c === 0x76
    /* v */
    ? '\x0B' : c === 0x66
    /* f */
    ? '\x0C' : c === 0x72
    /* r */
    ? '\x0D' : c === 0x65
    /* e */
    ? '\x1B' : c === 0x20
    /* Space */
    ? ' ' : c === 0x22
    /* " */
    ? '\x22' : c === 0x2F
    /* / */
    ? '/' : c === 0x5C
    /* \ */
    ? '\x5C' : c === 0x4E
    /* N */
    ? '\x85' : c === 0x5F
    /* _ */
    ? '\xA0' : c === 0x4C
    /* L */
    ? '\u2028' : c === 0x50
    /* P */
    ? '\u2029' : '';
  }

  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    } // Encode UTF-16 surrogate pair
    // https://en.wikipedia.org/wiki/UTF-16#Code_points_U.2B010000_to_U.2B10FFFF


    return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
  }

  var simpleEscapeCheck = new Array(256); // integer, for fast access

  var simpleEscapeMap = new Array(256);

  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }

  function State$1(input, options) {
    this.input = input;
    this.filename = options['filename'] || null;
    this.schema = options['schema'] || _default;
    this.onWarning = options['onWarning'] || null; // (Hidden) Remove? makes the loader to expect YAML 1.1 documents
    // if such documents have no explicit %YAML directive

    this.legacy = options['legacy'] || false;
    this.json = options['json'] || false;
    this.listener = options['listener'] || null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0; // position of first leading tab in the current line,
    // used to make sure there are no tabs in the indentation

    this.firstTabInLine = -1;
    this.documents = [];
    /*
    this.version;
    this.checkLineBreaks;
    this.tagMap;
    this.anchorMap;
    this.tag;
    this.anchor;
    this.kind;
    this.result;*/
  }

  function generateError(state, message) {
    var mark = {
      name: state.filename,
      buffer: state.input.slice(0, -1),
      // omit trailing \0
      position: state.position,
      line: state.line,
      column: state.position - state.lineStart
    };
    mark.snippet = snippet(mark);
    return new exception(message, mark);
  }

  function throwError(state, message) {
    throw generateError(state, message);
  }

  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }

  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      var match, major, minor;

      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }

      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }

      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);

      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }

      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);

      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }

      state.version = args[0];
      state.checkLineBreaks = minor < 2;

      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      var handle, prefix;

      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }

      handle = args[0];
      prefix = args[1];

      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }

      if (_hasOwnProperty$1.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }

      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }

      try {
        prefix = decodeURIComponent(prefix);
      } catch (err) {
        throwError(state, 'tag prefix is malformed: ' + prefix);
      }

      state.tagMap[handle] = prefix;
    }
  };

  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;

    if (start < end) {
      _result = state.input.slice(start, end);

      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);

          if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }

      state.result += _result;
    }
  }

  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;

    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }

    sourceKeys = Object.keys(source);

    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];

      if (!_hasOwnProperty$1.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }

  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
    var index, quantity; // The output is a plain object here, so keys can only be strings.
    // We need to convert keyNode to a string, but doing so can hang the process
    // (deeply nested arrays that explode exponentially using aliases).

    if (Array.isArray(keyNode)) {
      keyNode = Array.prototype.slice.call(keyNode);

      for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
        if (Array.isArray(keyNode[index])) {
          throwError(state, 'nested arrays are not supported inside keys');
        }

        if (typeof keyNode === 'object' && _class(keyNode[index]) === '[object Object]') {
          keyNode[index] = '[object Object]';
        }
      }
    } // Avoid code execution in load() via toString property
    // (still use its own toString for arrays, timestamps,
    // and whatever user schema extensions happen to have @@toStringTag)


    if (typeof keyNode === 'object' && _class(keyNode) === '[object Object]') {
      keyNode = '[object Object]';
    }

    keyNode = String(keyNode);

    if (_result === null) {
      _result = {};
    }

    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.lineStart = startLineStart || state.lineStart;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      } // used for this specific key only because Object.defineProperty is slow


      if (keyNode === '__proto__') {
        Object.defineProperty(_result, keyNode, {
          configurable: true,
          enumerable: true,
          writable: true,
          value: valueNode
        });
      } else {
        _result[keyNode] = valueNode;
      }

      delete overridableKeys[keyNode];
    }

    return _result;
  }

  function readLineBreak(state) {
    var ch;
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x0A
    /* LF */
    ) {
        state.position++;
      } else if (ch === 0x0D
    /* CR */
    ) {
        state.position++;

        if (state.input.charCodeAt(state.position) === 0x0A
        /* LF */
        ) {
            state.position++;
          }
      } else {
      throwError(state, 'a line break is expected');
    }

    state.line += 1;
    state.lineStart = state.position;
    state.firstTabInLine = -1;
  }

  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        if (ch === 0x09
        /* Tab */
        && state.firstTabInLine === -1) {
          state.firstTabInLine = state.position;
        }

        ch = state.input.charCodeAt(++state.position);
      }

      if (allowComments && ch === 0x23
      /* # */
      ) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0x0A
          /* LF */
          && ch !== 0x0D
          /* CR */
          && ch !== 0);
        }

      if (is_EOL(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;

        while (ch === 0x20
        /* Space */
        ) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }

    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }

    return lineBreaks;
  }

  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;
    ch = state.input.charCodeAt(_position); // Condition state.position === state.lineStart is tested
    // in parent on each call, for efficiency. No needs to test here again.

    if ((ch === 0x2D
    /* - */
    || ch === 0x2E
    /* . */
    ) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);

      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }

    return false;
  }

  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }

  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23
    /* # */
    || ch === 0x26
    /* & */
    || ch === 0x2A
    /* * */
    || ch === 0x21
    /* ! */
    || ch === 0x7C
    /* | */
    || ch === 0x3E
    /* > */
    || ch === 0x27
    /* ' */
    || ch === 0x22
    /* " */
    || ch === 0x25
    /* % */
    || ch === 0x40
    /* @ */
    || ch === 0x60
    /* ` */
    ) {
        return false;
      }

    if (ch === 0x3F
    /* ? */
    || ch === 0x2D
    /* - */
    ) {
        following = state.input.charCodeAt(state.position + 1);

        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          return false;
        }
      }

    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;

    while (ch !== 0) {
      if (ch === 0x3A
      /* : */
      ) {
          following = state.input.charCodeAt(state.position + 1);

          if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
            break;
          }
        } else if (ch === 0x23
      /* # */
      ) {
          preceding = state.input.charCodeAt(state.position - 1);

          if (is_WS_OR_EOL(preceding)) {
            break;
          }
        } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;
      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);

        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }

      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }

      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }

      ch = state.input.charCodeAt(++state.position);
    }

    captureSegment(state, captureStart, captureEnd, false);

    if (state.result) {
      return true;
    }

    state.kind = _kind;
    state.result = _result;
    return false;
  }

  function readSingleQuotedScalar(state, nodeIndent) {
    var ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x27
    /* ' */
    ) {
        return false;
      }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27
      /* ' */
      ) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);

          if (ch === 0x27
          /* ' */
          ) {
              captureStart = state.position;
              state.position++;
              captureEnd = state.position;
            } else {
            return true;
          }
        } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }

  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
    ch = state.input.charCodeAt(state.position);

    if (ch !== 0x22
    /* " */
    ) {
        return false;
      }

    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22
      /* " */
      ) {
          captureSegment(state, captureStart, state.position, true);
          state.position++;
          return true;
        } else if (ch === 0x5C
      /* \ */
      ) {
          captureSegment(state, captureStart, state.position, true);
          ch = state.input.charCodeAt(++state.position);

          if (is_EOL(ch)) {
            skipSeparationSpace(state, false, nodeIndent); // TODO: rework to inline fn with no type cast?
          } else if (ch < 256 && simpleEscapeCheck[ch]) {
            state.result += simpleEscapeMap[ch];
            state.position++;
          } else if ((tmp = escapedHexLen(ch)) > 0) {
            hexLength = tmp;
            hexResult = 0;

            for (; hexLength > 0; hexLength--) {
              ch = state.input.charCodeAt(++state.position);

              if ((tmp = fromHexCode(ch)) >= 0) {
                hexResult = (hexResult << 4) + tmp;
              } else {
                throwError(state, 'expected hexadecimal character');
              }
            }

            state.result += charFromCodepoint(hexResult);
            state.position++;
          } else {
            throwError(state, 'unknown escape sequence');
          }

          captureStart = captureEnd = state.position;
        } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }

    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }

  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _lineStart,
        _pos,
        _tag = state.tag,
        _result,
        _anchor = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = Object.create(null),
        keyNode,
        keyTag,
        valueNode,
        ch;

    ch = state.input.charCodeAt(state.position);

    if (ch === 0x5B
    /* [ */
    ) {
        terminator = 0x5D;
        /* ] */

        isMapping = false;
        _result = [];
      } else if (ch === 0x7B
    /* { */
    ) {
        terminator = 0x7D;
        /* } */

        isMapping = true;
        _result = {};
      } else {
      return false;
    }

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(++state.position);

    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      } else if (ch === 0x2C
      /* , */
      ) {
          // "flow collection entries can never be completely empty", as per YAML 1.2, section 7.4
          throwError(state, "expected the node content, but found ','");
        }

      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;

      if (ch === 0x3F
      /* ? */
      ) {
          following = state.input.charCodeAt(state.position + 1);

          if (is_WS_OR_EOL(following)) {
            isPair = isExplicitPair = true;
            state.position++;
            skipSeparationSpace(state, true, nodeIndent);
          }
        }

      _line = state.line; // Save the current line.

      _lineStart = state.lineStart;
      _pos = state.position;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if ((isExplicitPair || state.line === _line) && ch === 0x3A
      /* : */
      ) {
          isPair = true;
          ch = state.input.charCodeAt(++state.position);
          skipSeparationSpace(state, true, nodeIndent);
          composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
          valueNode = state.result;
        }

      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
      } else {
        _result.push(keyNode);
      }

      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);

      if (ch === 0x2C
      /* , */
      ) {
          readNext = true;
          ch = state.input.charCodeAt(++state.position);
        } else {
        readNext = false;
      }
    }

    throwError(state, 'unexpected end of the stream within a flow collection');
  }

  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent = nodeIndent,
        emptyLines = 0,
        atMoreIndented = false,
        tmp,
        ch;
    ch = state.input.charCodeAt(state.position);

    if (ch === 0x7C
    /* | */
    ) {
        folding = false;
      } else if (ch === 0x3E
    /* > */
    ) {
        folding = true;
      } else {
      return false;
    }

    state.kind = 'scalar';
    state.result = '';

    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);

      if (ch === 0x2B
      /* + */
      || ch === 0x2D
      /* - */
      ) {
          if (CHOMPING_CLIP === chomping) {
            chomping = ch === 0x2B
            /* + */
            ? CHOMPING_KEEP : CHOMPING_STRIP;
          } else {
            throwError(state, 'repeat of a chomping mode identifier');
          }
        } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }
      } else {
        break;
      }
    }

    if (is_WHITE_SPACE(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (is_WHITE_SPACE(ch));

      if (ch === 0x23
      /* # */
      ) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (!is_EOL(ch) && ch !== 0);
        }
    }

    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);

      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20
      /* Space */
      ) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }

      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }

      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      } // End of the scalar.


      if (state.lineIndent < textIndent) {
        // Perform the chomping.
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            // i.e. only if the scalar is not empty.
            state.result += '\n';
          }
        } // Break this `while` cycle and go to the funciton's epilogue.


        break;
      } // Folded style: use fancy rules to handle line breaks.


      if (folding) {
        // Lines starting with white space characters (more-indented lines) are not folded.
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true; // except for the first content line (cf. Example 8.1)

          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines); // End of more-indented block.
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1); // Just one line break - perceive as the same line.
        } else if (emptyLines === 0) {
          if (didReadContent) {
            // i.e. only if we have already read some scalar content.
            state.result += ' ';
          } // Several line breaks - perceive as different lines.

        } else {
          state.result += common.repeat('\n', emptyLines);
        } // Literal style: just add exact number of line breaks between content lines.

      } else {
        // Keep all line breaks except the header line break.
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }

      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;

      while (!is_EOL(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }

      captureSegment(state, captureStart, state.position, false);
    }

    return true;
  }

  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = [],
        following,
        detected = false,
        ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar


    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      if (ch !== 0x2D
      /* - */
      ) {
          break;
        }

      following = state.input.charCodeAt(state.position + 1);

      if (!is_WS_OR_EOL(following)) {
        break;
      }

      detected = true;
      state.position++;

      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);

          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }

      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);

      _result.push(state.result);

      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);

      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }

    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }

    return false;
  }

  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _keyLine,
        _keyLineStart,
        _keyPos,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = {},
        overridableKeys = Object.create(null),
        keyTag = null,
        keyNode = null,
        valueNode = null,
        atExplicitKey = false,
        detected = false,
        ch; // there is a leading tab before this token, so it can't be a block sequence/mapping;
    // it can still be flow sequence/mapping or a scalar


    if (state.firstTabInLine !== -1) return false;

    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }

    ch = state.input.charCodeAt(state.position);

    while (ch !== 0) {
      if (!atExplicitKey && state.firstTabInLine !== -1) {
        state.position = state.firstTabInLine;
        throwError(state, 'tab characters must not be used in indentation');
      }

      following = state.input.charCodeAt(state.position + 1);
      _line = state.line; // Save the current line.
      //
      // Explicit notation case. There are two separate blocks:
      // first for the key (denoted by "?") and second for the value (denoted by ":")
      //

      if ((ch === 0x3F
      /* ? */
      || ch === 0x3A
      /* : */
      ) && is_WS_OR_EOL(following)) {
        if (ch === 0x3F
        /* ? */
        ) {
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
              keyTag = keyNode = valueNode = null;
            }

            detected = true;
            atExplicitKey = true;
            allowCompact = true;
          } else if (atExplicitKey) {
          // i.e. 0x3A/* : */ === character after the explicit key.
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line');
        }

        state.position += 1;
        ch = following; //
        // Implicit notation case. Flow-style node as the key first, then ":", and the value.
        //
      } else {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;

        if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
          // Neither implicit nor explicit notation.
          // Reading is done. Go to the epilogue.
          break;
        }

        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);

          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }

          if (ch === 0x3A
          /* : */
          ) {
              ch = state.input.charCodeAt(++state.position);

              if (!is_WS_OR_EOL(ch)) {
                throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
              }

              if (atExplicitKey) {
                storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
                keyTag = keyNode = valueNode = null;
              }

              detected = true;
              atExplicitKey = false;
              allowCompact = false;
              keyTag = state.tag;
              keyNode = state.result;
            } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true; // Keep the result of `composeNode`.
          }
        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true; // Keep the result of `composeNode`.
        }
      } //
      // Common reading code for both explicit and implicit notations.
      //


      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (atExplicitKey) {
          _keyLine = state.line;
          _keyLineStart = state.lineStart;
          _keyPos = state.position;
        }

        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }

        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }

        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }

      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    } //
    // Epilogue.
    //
    // Special case: last mapping's node contains only the key in explicit notation.


    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
    } // Expose the resulting mapping.


    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }

    return detected;
  }

  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed = false,
        tagHandle,
        tagName,
        ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x21
    /* ! */
    ) return false;

    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }

    ch = state.input.charCodeAt(++state.position);

    if (ch === 0x3C
    /* < */
    ) {
        isVerbatim = true;
        ch = state.input.charCodeAt(++state.position);
      } else if (ch === 0x21
    /* ! */
    ) {
        isNamed = true;
        tagHandle = '!!';
        ch = state.input.charCodeAt(++state.position);
      } else {
      tagHandle = '!';
    }

    _position = state.position;

    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 0x3E
      /* > */
      );

      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        if (ch === 0x21
        /* ! */
        ) {
            if (!isNamed) {
              tagHandle = state.input.slice(_position - 1, state.position + 1);

              if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
                throwError(state, 'named tag handle cannot contain such characters');
              }

              isNamed = true;
              _position = state.position + 1;
            } else {
              throwError(state, 'tag suffix cannot contain exclamation marks');
            }
          }

        ch = state.input.charCodeAt(++state.position);
      }

      tagName = state.input.slice(_position, state.position);

      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }

    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }

    try {
      tagName = decodeURIComponent(tagName);
    } catch (err) {
      throwError(state, 'tag name is malformed: ' + tagName);
    }

    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;
    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }

    return true;
  }

  function readAnchorProperty(state) {
    var _position, ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x26
    /* & */
    ) return false;

    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }

    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }

    state.anchor = state.input.slice(_position, state.position);
    return true;
  }

  function readAlias(state) {
    var _position, alias, ch;

    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x2A
    /* * */
    ) return false;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;

    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }

    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }

    alias = state.input.slice(_position, state.position);

    if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }

    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }

  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1,
        // 1: this>parent, 0: this=parent, -1: this<parent
    atNewLine = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        typeList,
        type,
        flowIndent,
        blockIndent;

    if (state.listener !== null) {
      state.listener('open', state);
    }

    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;

    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;

        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }

    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;

          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }

    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }

    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }

      blockIndent = state.position - state.lineStart;

      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;

            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;

            if (state.tag === null) {
              state.tag = '?';
            }
          }

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        // Special case: block sequences are allowed to have same indentation level as the parent.
        // http://www.yaml.org/spec/1.2/spec.html#id2799784
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }

    if (state.tag === null) {
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    } else if (state.tag === '?') {
      // Implicit resolving is not allowed for non-scalar types, and '?'
      // non-specific tag is only automatically assigned to plain scalars.
      //
      // We only need to check kind conformity in case user explicitly assigns '?'
      // tag, for example like this: "!<?> [0]"
      //
      if (state.result !== null && state.kind !== 'scalar') {
        throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
      }

      for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
        type = state.implicitTypes[typeIndex];

        if (type.resolve(state.result)) {
          // `state.result` updated in resolver if matched
          state.result = type.construct(state.result);
          state.tag = type.tag;

          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }

          break;
        }
      }
    } else if (state.tag !== '!') {
      if (_hasOwnProperty$1.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];
      } else {
        // looking for multi type
        type = null;
        typeList = state.typeMap.multi[state.kind || 'fallback'];

        for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
          if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
            type = typeList[typeIndex];
            break;
          }
        }
      }

      if (!type) {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }

      if (state.result !== null && type.kind !== state.kind) {
        throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
      }

      if (!type.resolve(state.result, state.tag)) {
        // `state.result` updated in resolver if matched
        throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
      } else {
        state.result = type.construct(state.result, state.tag);

        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    }

    if (state.listener !== null) {
      state.listener('close', state);
    }

    return state.tag !== null || state.anchor !== null || hasContent;
  }

  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;

    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = Object.create(null);
    state.anchorMap = Object.create(null);

    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);

      if (state.lineIndent > 0 || ch !== 0x25
      /* % */
      ) {
          break;
        }

      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;

      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }

      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];

      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }

      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        if (ch === 0x23
        /* # */
        ) {
            do {
              ch = state.input.charCodeAt(++state.position);
            } while (ch !== 0 && !is_EOL(ch));

            break;
          }

        if (is_EOL(ch)) break;
        _position = state.position;

        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }

        directiveArgs.push(state.input.slice(_position, state.position));
      }

      if (ch !== 0) readLineBreak(state);

      if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }

    skipSeparationSpace(state, true, -1);

    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D
    /* - */
    && state.input.charCodeAt(state.position + 1) === 0x2D
    /* - */
    && state.input.charCodeAt(state.position + 2) === 0x2D
    /* - */
    ) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }

    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);

    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }

    state.documents.push(state.result);

    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 0x2E
      /* . */
      ) {
          state.position += 3;
          skipSeparationSpace(state, true, -1);
        }

      return;
    }

    if (state.position < state.length - 1) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }

  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};

    if (input.length !== 0) {
      // Add tailing `\n` if not exists
      if (input.charCodeAt(input.length - 1) !== 0x0A
      /* LF */
      && input.charCodeAt(input.length - 1) !== 0x0D
      /* CR */
      ) {
          input += '\n';
        } // Strip BOM


      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }

    var state = new State$1(input, options);
    var nullpos = input.indexOf('\0');

    if (nullpos !== -1) {
      state.position = nullpos;
      throwError(state, 'null byte is not allowed in input');
    } // Use 0 as string terminator. That significantly simplifies bounds check.


    state.input += '\0';

    while (state.input.charCodeAt(state.position) === 0x20
    /* Space */
    ) {
      state.lineIndent += 1;
      state.position += 1;
    }

    while (state.position < state.length - 1) {
      readDocument(state);
    }

    return state.documents;
  }

  function loadAll$1(input, iterator, options) {
    if (iterator !== null && typeof iterator === 'object' && typeof options === 'undefined') {
      options = iterator;
      iterator = null;
    }

    var documents = loadDocuments(input, options);

    if (typeof iterator !== 'function') {
      return documents;
    }

    for (var index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }

  function load$1(input, options) {
    var documents = loadDocuments(input, options);

    if (documents.length === 0) {
      /*eslint-disable no-undefined*/
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }

    throw new exception('expected a single document in the stream, but found more');
  }

  var loadAll_1 = loadAll$1;
  var load_1 = load$1;
  var loader = {
    loadAll: loadAll_1,
    load: load_1
  };
  var load = loader.load;

  async function chooseOption(title, options, defaultValue) {
    var _options$index$value, _options$index;

    const {
      index
    } = await CommandBar.showOptions(options.map(option => option.label), title);
    return (_options$index$value = (_options$index = options[index]) === null || _options$index === void 0 ? void 0 : _options$index.value) !== null && _options$index$value !== void 0 ? _options$index$value : defaultValue;
  }
  async function showMessage(title, okLabel = 'OK') {
    await CommandBar.showOptions([okLabel], title);
  }

  const staticTemplateFolder = '📋 Templates';
  /**
   * Get the Templates folder path, if it exists
   * @author @nmn
   * @return { ?string } - folder pathname
   */

  function getTemplateFolder() {
    return DataStore.folders.find(f => f.includes(staticTemplateFolder));
  }
  /**
   * Write out a new _configuration file
   * @author @jgclark
   */

  function createDefaultConfigNote() {
    const folder = getTemplateFolder();

    if (folder != null) {
      DataStore.newNote(CONFIG, folder);
    }
  }
  /**
   * Get the Templates folder path, without leading '/'
   * If it doesn't exist, offer to create it and populate it with samples
   * @author @nmn
   * @return { ?string } - relative folder pathname (without leading '/')
   */

  async function getOrMakeTemplateFolder() {
    // console.log('  getOrMakeTemplateFolder start')
    let folder = getTemplateFolder();

    if (folder == null) {
      console.log('  getOrMakeTemplateFolder: no folder found'); // No template folder yet, so offer to make it and populate it

      const shouldCreateFolder = await chooseOption$1('No templates folder found.', [{
        label: "\u2705 Create ".concat(staticTemplateFolder, " with samples"),
        value: true
      }, {
        label: '❌ Cancel command',
        value: false
      }], false);

      if (!shouldCreateFolder) {
        return;
      }

      const subFolder = await chooseOption$1('Select a location for the templates folder.', DataStore.folders.map(folder => ({
        label: folder,
        value: folder + (folder.endsWith('/') ? '' : '/') // ensure ends with '/'

      })), '');
      folder = subFolder + staticTemplateFolder; // Now create a sample note in that folder, then we got the folder also created

      DataStore.newNote(DAILY_NOTE_TEMPLATE, folder);
      DataStore.newNote(MEETING_NOTE_TEMPLATE, folder);
      DataStore.newNote(TAGS_TEMPLATE, folder);
      DataStore.newNote(CONFIG, folder); // for 'folder' to be useful straight away we need to strip off any leading '/'

      folder = folder.startsWith('/') ? folder.slice(1) : folder;
      console.log("-> \"".concat(folder, "\" folder created with samples"));
      await showMessage$1("\"".concat(folder, "\" folder created with samples"));
    }

    return folder;
  }
  /*

  DEFAULT TEMPLATE NOTES FOLLOW

  */

  const DAILY_NOTE_TEMPLATE = "Daily Note Template\n---\n## Tasks\n\n## Media\n> {{quote()}}\n\n## Journal\nWeather: {{weather()}}\n";
  const MEETING_NOTE_TEMPLATE = "Meeting Note Template\n---\n## Project X Meeting on [[{{date-as-YYYY-MM-DD}}]] with {{people list}}\n\n## Notes\n\n## Actions\n";
  const TAGS_TEMPLATE = "Tags Template\n---\n# {{title}}\n\nCreated on {{date({locale: 'en-US', dateStyle: 'short'})}}\n";
  const CONFIG = " _configuration\n---\n# Template Tag Configuration\n\nThis file is used to configure how templates work. \nUse the code fence below (which comes after a line made by 3 dashes)\nto set global values for template tags.\n\nTo write your configuration you can use JSON5. JSON5 is a human-friendly\nsuperset of JSON that lets you write comments, unquoted keys and other common\npatterns available in Javscript.\n(NB: even JSON5 doesn't fully support multi-line strings, so to include\nthem you need to use \"\n\" for linebreaks rather than actual linebreaks.)\n\nJust use the codeblock marked as `javascript` shown below to write your own\ncustom configurayion.\n\nThe *first* code-block within the note will always be used. So edit the default configuration below:\n\nIMPORTANT: The configuration code blocks below are validated in realtime by Noteplan as you edit. \nIf the configuration passes the validation, you will see configuration settings in color (e.g. orange, \ngreen, purple, black, etc.). If there is a mistake in your configuration settings, the configuration\nsettings below will all be black. If you have a quoted \"string\" that you want to have a line break\nin it, insert a \"\n\" where you want the line break, e.g. \"This\nIs\nThreelines\"\n\n```javascript\n{\n  // Even though it says, \"javascript\" above, this is actually JSON5.\n\n  // configuration for dates, heavily based on javascript's Intl module\n  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat\n  date: {\n    // Default timezone for date and time.\n    timezone: 'automatic',\n    // Default locale to format date and time.\n    // e.g. en-US will result in mm/dd/yyyy, while en_GB will be dd/mm/yyyy\n    locale: 'en-US',\n    // can be \"short\", \"medium\", \"long\" or \"full\"\n    dateStyle: 'short',\n    // optional key, can be \"short\", \"medium\", \"long\" or \"full\"\n    timeStyle: 'short',\n  },\n\n  // configuration for weather data (used in Daily Note Template, for example)\n  weather: {\n    // API key for https://openweathermap.org/\n    // !!REQUIRED!!\n    openWeatherAPIKey: '... put your API key here ...',\n    // Required location for weather forecast\n    latPosition: 0.0,\n    longPosition: 0.0,\n    // Default units. Can be 'metric' (for Celsius), or 'metric' (for Fahrenheit)\n    openWeatherUnits: 'metric',\n  },\n\n  // configuration for daily quote (used in Daily Note Template, for example)\n  quote: {\n    // Available modes: [random (default), today, author]\n    mode: 'today',\n    // API key required, available authors: https://premium.zenquotes.io/available-authors/\n    author: 'anne-frank',\n    // Required for mode: 'author' (from https://premium.zenquotes.io/)\n    apiKey: '... put your API key here ...',\n  },\n\n  // default values for custom tags.\n  // These tags cannot be functions, but you may choose to have nested objects.\n  // feel free to edit this value however you see fit.\n  tagValue: {\n    me: {\n      // Can be used as {{me.firstName}}\n      firstName: 'John',\n      // Can be used as {{me.lastName}}\n      lastName: 'Doe',\n    }\n    // ...\n  },\n}\n```\n\n";

  const ALLOWED_FORMATS = ['javascript', 'json', 'json5', 'yaml', 'toml', 'ini'];
  const FORMAT_MAP = {
    javascript: 'json5',
    ini: 'toml'
  }; // @nmn original, but split up by @jgclark

  async function parseFirstCodeblock(block) {
    var _FORMAT_MAP$format;

    if (block == null) {
      await showMessage('No configuration block found in configuration file.');
      return {};
    }

    let [format, ...contents] = block.split('\n');
    contents = contents.join('\n');
    format = format.trim();

    if (!ALLOWED_FORMATS.includes(format)) {
      await showMessage('Invalid configuration format in the config file.');
      return {};
    }

    format = (_FORMAT_MAP$format = FORMAT_MAP[format]) !== null && _FORMAT_MAP$format !== void 0 ? _FORMAT_MAP$format : format;
    console.log("\tparseFirstCodeblock: will parse ".concat(contents.length, " bytes of ").concat(format));

    switch (format) {
      case 'json':
        return parseJSON(contents);

      case 'json5':
        return parseJSON5(contents);

      case 'yaml':
        return parseYAML(contents);

      case 'toml':
        return parseTOML(contents);

      default:
        console.log("\tparseFirstCodeblock: error: can't deal with format ".concat(format));
    }
  } // Get configuration section, or if not present, save into _configuraiton file
  // Only deals with json5 case
  // @jgclark

  async function getOrMakeConfigurationSection(configSectionName, configSectionDefault) {
    var _configFile, _await$parseFirstCode;

    let templateFolder = await getOrMakeTemplateFolder();

    if (templateFolder == null) {
      console.log("  getOrMakeConfigurationSection: couldn't find the templateFolder ... will try to create it ...");
      templateFolder = getOrMakeTemplateFolder();
      return {};
    }

    console.log("  getOrMakeConfigurationSection: got folder ".concat(templateFolder));
    let configFile = DataStore.projectNotes // $FlowIgnore[incompatible-call]
    .filter(n => {
      var _n$filename2;

      return (_n$filename2 = n.filename) === null || _n$filename2 === void 0 ? void 0 : _n$filename2.startsWith(templateFolder);
    }).find(n => {
      var _n$title2;

      return !!((_n$title2 = n.title) !== null && _n$title2 !== void 0 && _n$title2.startsWith('_configuration'));
    });

    if (configFile == null) {
      console.log("  getOrMakeConfigurationSection: Error: cannot find '_configuration' fil. Will create from default.");
      createDefaultConfigNote();
      configFile = DataStore.projectNotes // $FlowIgnore[incompatible-call]
      .filter(n => {
        var _n$filename3;

        return (_n$filename3 = n.filename) === null || _n$filename3 === void 0 ? void 0 : _n$filename3.startsWith(templateFolder);
      }).find(n => {
        var _n$title3;

        return !!((_n$title3 = n.title) !== null && _n$title3 !== void 0 && _n$title3.startsWith('_configuration'));
      });
    }

    const content = (_configFile = configFile) === null || _configFile === void 0 ? void 0 : _configFile.content;

    if (configFile == null || content == null) {
      console.log("  getOrMakeConfigurationSection: Error: '_configuration' file not found or empty");
      await showMessage("Error: missing or empty '_configuration' file. Please check."); // Really strange to get here: won't code a response, but will just stop.

      return {};
    }

    console.log('  getOrMakeConfigurationSection: got _configuration file'); // Get config contents

    const firstCodeblock = content.split('\n```')[1];
    const config = (_await$parseFirstCode = await parseFirstCodeblock(firstCodeblock)) !== null && _await$parseFirstCode !== void 0 ? _await$parseFirstCode : {}; // Does it contain the section we want?

    if (firstCodeblock == null || config[configSectionName] == // alternative to dot notation that allows variables
    null) {
      // No, so offer to make it and populate it
      const shouldAddDefaultConfig = await chooseOption("No '".concat(configSectionName, "' configuration section found."), [{
        label: "\u2705 Create ".concat(configSectionName, " configuration from its defaults"),
        value: true
      }, {
        label: "\u274C Don't Create; cancel command",
        value: false
      }], false);

      if (!shouldAddDefaultConfig) {
        return {};
      } // Add default configuration


      const backtickParas = configFile.paragraphs.filter(p => p.content.match(/```/)); // const startJSFirstBlockParas = configFile.paragraphs.filter((p) => p.content.match(/^```\s*javascript/))

      if (backtickParas.length > 0 && backtickParas[0].content.endsWith('javascript')) {
        // Insert new default configuration at the top of the current _configuration block
        const startFirstBlockLineNumber = backtickParas[0].lineIndex + 2; // const endFirstBlockLineNumber = backtickParas[1].lineIndex - 1 // this used to do the bottom of the block
        // insert paragraph just before second ``` line

        if (startFirstBlockLineNumber !== undefined) {
          configFile.insertParagraph(configSectionDefault, startFirstBlockLineNumber, 'text');
          await showMessage("Inserted default configuration for ".concat(configSectionName, "."), "OK: I will check this before re-running the command.");
          Editor.openNoteByFilename(configFile.filename);
          return {};
        } else {
          await showMessage("Error: cannot create default configuration for ".concat(configSectionName), "OK: I will check this before re-running the command.");
          Editor.openNoteByFilename(configFile.filename);
          return {};
        }
      } else {
        // Couldn't find javascript first codeblock, so insert it at line 2
        const configAsJSBlock = "``` javascript\n{\n".concat(configSectionDefault, "\n}\n```");
        configFile.insertParagraph(configAsJSBlock, 2, 'text');
        await showMessage("Created default configuration for ".concat(configSectionName, "."), "OK: I will check this before re-running the command.");
        Editor.openNoteByFilename(configFile.filename);
        return {};
      }
    } // We have the configuration, so return it
    // $FlowIgnore


    return config[configSectionName];
  }

  async function parseJSON(contents) {
    try {
      return JSON.parse(contents);
    } catch (e) {
      console.log(e);
      await showMessage('Invalid JSON in your configuration. Please fix it to use configuration');
      return {};
    }
  }

  async function parseJSON5(contents) {
    try {
      const value = lib.parse(contents);
      return value;
    } catch (e) {
      console.log(e);
      await showMessage('Invalid JSON5 in your configuration. Please fix it to use configuration');
      return {};
    }
  }

  async function parseYAML(contents) {
    try {
      const value = load(contents);

      if (typeof value === 'object') {
        return value;
      } else {
        return {};
      }
    } catch (e) {
      console.log(contents);
      console.log(e);
      await showMessage('Invalid YAML in your configuration. Please fix it to use configuration');
      return {};
    }
  }

  async function parseTOML(contents) {
    try {
      const value = toml.parse(contents);

      if (typeof value === 'object') {
        return value;
      } else {
        return {};
      }
    } catch (e) {
      console.log(e);
      await showMessage('Invalid TOML in your configuration. Please fix it to use configuration');
      return {};
    }
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  /*
   * Get or create the relevant note in the Summary folder
   * @param {string} noteTitle - title of summary note
   * @param {string} noteFolder - folder to look in
   * @return {Promise<TNote>} - note object
   */

  async function returnSummaryNote(noteTitle, noteFolder) {
    var _DataStore$projectNot;

    // first see if this note has already been created (ignore Archive and Trash)
    const existingNotes = (_DataStore$projectNot = DataStore.projectNoteByTitle(noteTitle, true, false)) !== null && _DataStore$projectNot !== void 0 ? _DataStore$projectNot : [];
    console.log("\tfound ".concat(existingNotes.length, " existing summary note(s)"));

    if (existingNotes.length > 0) {
      // console.log(`\t${existingNotes[0].filename}`)
      return existingNotes[0]; // return the only or first match (if more than one)
    } else {
      // make a new note for this
      const noteFilename = await DataStore.newNote(noteTitle, noteFolder); // NB: filename here = folder + filename

      if (noteFilename != null && noteFilename !== '') {
        console.log("\tnewNote filename: ".concat(String(noteFilename)));
        const note = await DataStore.projectNoteByFilename(noteFilename);

        if (note != null) {
          return note;
        } else {
          showMessage$1("Oops: I can't make new _reviews note", 'OK');
          console.log("returnSummaryNote: error: can't read new _reviews note");
          return;
        }
      } else {
        showMessage$1("Oops: I can't make new _reviews note", 'OK');
        console.log("returnSummaryNote: error: empty filename of new _reviews note");
        return;
      }
    }
  }
  /*
   * Return list of notes with a particular hashtag, optionally in the given folder.
   * @param {string} tag - tag name to look for (or blank, in which case no filtering by tag)
   * @param {?string} folder - optional folder to limit to
   * @param {?boolean} includeSubfolders - if folder given, whether to look in subfolders of this folder or not (optional, defaults to false)
   * @return {Array<TNote>}
   */

  function findNotesMatchingHashtags(tag, folder, includeSubfolders = false) {
    let projectNotesInFolder; // If folder given (not empty) then filter using it

    if (folder != null) {
      if (includeSubfolders) {
        // use startsWith as filter to include subfolders
        projectNotesInFolder = DataStore.projectNotes.slice().filter(n => n.filename.startsWith("".concat(folder, "/")));
      } else {
        // use match as filter to exclude subfolders
        projectNotesInFolder = DataStore.projectNotes.slice().filter(n => getFolderFromFilename(n.filename) === folder);
      }
    } else {
      // no folder specified, so grab all notes from DataStore
      projectNotesInFolder = DataStore.projectNotes.slice();
    } // Filter by tag (if one has been given)


    const projectNotesWithTag = tag !== '' ? projectNotesInFolder.filter(n => n.hashtags.includes(tag)) : projectNotesInFolder;
    console.log("\tFound ".concat(projectNotesWithTag.length, " notes matching tag '").concat(tag, "'"));
    return projectNotesWithTag;
  }
  function calcNextReviewDate(lastReviewDate, interval) {
    // RUBY:
    // @next_review_date = !@last_review_date.nil? ? calc_offset_date(@last_review_date, @review_interval) : TODAYS_DATE
    const reviewDate = lastReviewDate != null ? calcOffsetDate(toISODateString(lastReviewDate), interval) : new Date(); // today's date

    return reviewDate;
  }
  /* From an array of strings, return the first string that matches the
  *  wanted parameterised @mention, or empty String
  * @param {Array<string>} mentionList - list of strings to search
  * @param {string} metnion - string to match (with a following '(' to indicate start of parameter)
  * @return {?Date} - JS Date version, if valid date found
  */

  function getParamMentionFromList(mentionList, mention) {
    // console.log(`getMentionFromList for: ${mention}`)
    const res = mentionList.filter(m => m.startsWith("".concat(mention, "(")));
    return res.length > 0 ? res[0] : '';
  }
  /* From an array of strings, return the first string that matches the wanted string
  * @param {Array<string>} list - list of strings to search
  * @param {string} search - string to match
  */

  function getStringFromList(list, search) {
    // console.log(`getsearchFromList for: ${search}`)
    const res = list.filter(m => m === search);
    return res.length > 0 ? res[0] : '';
  }
  /* Turn a string that includes YYYY-MM-DD into a JS Date
  * @param {string} - string that contains a date e.g. @due(2021-03-04)
  * @return {?Date} - JS Date version, if valid date found
  */

  function getDateFromString(mention) {
    var _mention$match;

    const RE_DATE_CAPTURE = "(".concat(RE_DATE, ")"); // capture date of form YYYY-MM-DD

    if (mention === '') {
      // console.log(`\tgetDateFromString: empty string`)
      return; // no text, so return nothing
    } // console.log(`\tgetDateFromString: ${mention}`)


    const res = (_mention$match = mention.match(RE_DATE_CAPTURE)) !== null && _mention$match !== void 0 ? _mention$match : []; // Use first match, if found

    if (res[1].length > 0) {
      const date = new Date(Number(res[1].slice(0, 4)), Number(res[1].slice(5, 7)) - 1, // only seems to be needed for months?!
      Number(res[1].slice(8, 10))); // console.log(toLocaleDateTimeString(date))

      return date;
    } else {
      // console.log(`\tgetDateFromString: no date found`)
      return;
    }
  }
  /* Extract bracketed part of an '@mention(something)' string
  * @param {string} - string that contains a bracketed mention e.g. @review(2w)
  * @return {?string} - string from between the brackets, if found (e.g. '2w')
  */

  function getStringFromMention(mention) {
    var _mention$match2;

    const RE_MENTION_STRING_CAPTURE = '\\((.*?)\\)'; // capture string inside parantheses

    if (mention === '') {
      // console.log(`\tgetStringFromMention: empty string`)
      return; // no text, so return nothing
    } // console.log(`\tgetStringFromMention: ${mention}`)


    const res = (_mention$match2 = mention.match(RE_MENTION_STRING_CAPTURE)) !== null && _mention$match2 !== void 0 ? _mention$match2 : [];

    if (res[1].length > 0) {
      return res[1];
    } else {
      return;
    }
  }
  /* Return difference between start and end dates
  * @param {Date} d1 - start Date
  * @param {Date} d2 - end Date
  * @return {number} - number of days between d1 and d2 (rounded to nearest integer)
  */

  function daysBetween(d1, d2) {
    return Math.round((d2 - d1) / 1000 / 60 / 60 / 24); // i.e. milliseconds -> days
  } //-------------------------------------------------------------------------------
  // Define 'Project' class to use in GTD.
  // Holds title, last reviewed date, due date, review interval, completion date,
  // number of closed, open & waiting for tasks
  // NOTE: @nmn says class syntax is likely not supported in Safari 11.

  class Project {
    // Types for the class properties
    // TODO: Does this make any sense to keep?
    // project, area, other
    constructor(note) {
      var _note$title;

      _defineProperty(this, "note", void 0);

      _defineProperty(this, "title", void 0);

      _defineProperty(this, "dueDate", void 0);

      _defineProperty(this, "dueDays", void 0);

      _defineProperty(this, "reviewedDate", void 0);

      _defineProperty(this, "reviewInterval", void 0);

      _defineProperty(this, "nextReviewDate", void 0);

      _defineProperty(this, "nextReviewDays", void 0);

      _defineProperty(this, "completedDate", void 0);

      _defineProperty(this, "completedDays", void 0);

      _defineProperty(this, "isCompleted", void 0);

      _defineProperty(this, "openTasks", void 0);

      _defineProperty(this, "completedTasks", void 0);

      _defineProperty(this, "waitingTasks", void 0);

      _defineProperty(this, "isArchived", void 0);

      _defineProperty(this, "isActive", void 0);

      _defineProperty(this, "noteType", void 0);

      const mentions = note.mentions;
      const hashtags = note.hashtags;
      this.note = note;
      this.title = (_note$title = note.title) !== null && _note$title !== void 0 ? _note$title : '(error)';
      this.dueDate = getDateFromString(getParamMentionFromList(mentions, "@due")); // this.dueDate = getDateFromString(getParamMentionFromList(mentions, "@due"))
      // FIXME(Eduard): Error in next API function so use my own instead
      // this.dueDays = (this.dueDate !== '') ? Calendar.unitsBetween(new Date(), this.dueDate, 'day') : undefined

      if (this.dueDate != null && this.dueDate !== '') {
        // $FlowIgnore[incompatible-call]
        this.dueDays = daysBetween(new Date(), this.dueDate);
      }

      this.reviewedDate = getDateFromString(getParamMentionFromList(mentions, "@reviewed"));
      this.reviewInterval = getStringFromMention(getParamMentionFromList(mentions, "@review"));

      if (this.reviewInterval != null) {
        if (this.reviewedDate != null) {
          this.nextReviewDate = calcNextReviewDate(this.reviewedDate, this.reviewInterval); // FIXME(Eduard): Error in next API function so use my own instead
          // this.nextReviewDays = (this.nextReviewDate !== '') ? Calendar.unitsBetween(new Date(), this.dueDate, 'day') : undefined
          // $FlowIgnore[incompatible-call]

          this.nextReviewDays = daysBetween(new Date(), this.nextReviewDate); // console.log(`  ${this.nextReviewDate.toString()} -> ${this.nextReviewDays}`)
        } else {
          // no next review date, so set at today
          this.nextReviewDate = new Date();
          this.nextReviewDays = 0;
        }
      }

      this.completedDate = getDateFromString(getParamMentionFromList(mentions, "@completed"));
      this.completedDays = this.completedDate !== '' ? // $FlowIgnore[incompatible-call]
      daysBetween(new Date(), this.completedDate) : undefined;
      this.openTasks = note.paragraphs.filter(p => p.type === 'open').length;
      this.completedTasks = note.paragraphs.filter(p => p.type === 'done').length;
      this.waitingTasks = note.paragraphs.filter(p => p.type === 'open').filter(p => p.content.match('#waiting')).length; // make completed if @completed_date set

      this.isCompleted = this.completedDate != null ? true : false; // make archived if #archive tag present

      this.isArchived = getStringFromList(hashtags, '#archive') !== ''; // make cancelled if #cancelled or #someday flag set
      // @is_cancelled = true if @metadata_line =~ /(#cancelled|#someday)/
      // set note to active if #active is set or a @review date found,
      // and not completed / cancelled.

      this.isActive = (getStringFromList(hashtags, '#active') !== '' || this.reviewInterval != null) && !this.isCompleted && !this.isArchived ? true : false;
    }
    /* return title of note as internal link, also showing complete or cancelled where relevant
    * @return {string} - title as wikilink
    */


    get decoratedProjectTitle() {
      if (this.isCompleted) {
        var _this$title;

        return "[x] [[".concat((_this$title = this.title) !== null && _this$title !== void 0 ? _this$title : '', "]]");
      } else if (this.isArchived) {
        var _this$title2;

        return "[-] [[".concat((_this$title2 = this.title) !== null && _this$title2 !== void 0 ? _this$title2 : '', "]]");
      } else {
        var _this$title3;

        return "[[".concat((_this$title3 = this.title) !== null && _this$title3 !== void 0 ? _this$title3 : '', "]]");
      }
    }
    /* return true if review is overdue and not archived or completed
    * @return {boolean} - is this ready for review?
    */


    get isReadyForReview() {
      // console.log(`isReadyForReview: ${this.title}:  ${this.nextReviewDays} ${this.isActive}`)
      return this.nextReviewDays != null && this.nextReviewDays <= 0 && this.isActive;
    }
    /* Returns CSV line showing days until next review + title
     * @return {string}
    */


    basicSummaryLine() {
      var _this$nextReviewDays$, _this$nextReviewDays;

      const numString = (_this$nextReviewDays$ = (_this$nextReviewDays = this.nextReviewDays) === null || _this$nextReviewDays === void 0 ? void 0 : _this$nextReviewDays.toString()) !== null && _this$nextReviewDays$ !== void 0 ? _this$nextReviewDays$ : '';
      return "".concat(numString, "\t").concat(this.title); // return `${numString}\t${this.title}\t${this.isActive.toString()}\t${this.completedDays?.toString() ?? ''}`
    }
    /* Returns line showing more detailed summary of the note, treated as a project
     * @return {string}
    */


    detailedSummaryLine() {
      let output = "- ".concat(this.decoratedProjectTitle);

      if (this.completedDate != null) {
        // $FlowIgnore[incompatible-call]
        output += "\t(Completed ".concat(relativeDateFromNumber(this.completedDays), ")");
      } else {
        output += "\to".concat(this.openTasks, " / c").concat(this.completedTasks, " / w").concat(this.waitingTasks);
        output = this.nextReviewDays != null ? "".concat(output, " / ").concat(relativeDateFromNumber(this.nextReviewDays)) : "".concat(output, " / -");
        output = this.dueDays != null ? "".concat(output, " / ").concat(relativeDateFromNumber(this.dueDays)) : "".concat(output, " / -");
      }

      return output;
    }

  }

  //-----------------------------------------------------------------------------
  // Commands for Reviewing project notes, GTD-style.
  // by @jgclark
  // v0.2.1, 30.7.2021
  //-----------------------------------------------------------------------------
  // TODO:s below
  // Settings
  const DEFAULT_REVIEW_OPTIONS = "  review: {\n    folderToStore: \"Summaries\",\n    foldersToIgnore: [\"Templates\", \"Summaries\"], // can be empty\n    noteTypeTags: \"#area,#project\",\n    displayGroupedByFolder: true,\n    displayOrder: \"alpha\" // 'due', 'review' or 'alpha'\n  },\n";
  let pref_noteTypeTags = '#project,#area';
  let pref_folderToStore = 'Summaries';
  let pref_foldersToIgnore = ["Templates", "Summaries"];
  let pref_displayGroupedByFolder = true;
  let pref_displayOrder = 'alpha'; // Constants

  const reviewListNoteTitle = '_reviews'; //-----------------------------------------------------------------------------
  // Create human-readable lists of project notes for each tag of interest

  async function getConfig() {
    // Get config settings from Template folder _configuration note
    const reviewConfig = await getOrMakeConfigurationSection('review', DEFAULT_REVIEW_OPTIONS);

    if (reviewConfig == null) {
      console.log("\tCouldn't find 'review' settings in _configuration note.");
      await showMessage$1("Couldn't find 'review' settings in _configuration note.");
      return;
    }

    console.log("\tFound 'review' settings in _configuration note."); // now get the settings we need

    if (reviewConfig.noteTypeTags != null && typeof reviewConfig.noteTypeTags === 'string') {
      pref_noteTypeTags = reviewConfig.noteTypeTags;
    } // console.log(pref_noteTypeTags)


    if (reviewConfig.folderToStore != null && typeof reviewConfig.folderToStore === 'string') {
      pref_folderToStore = reviewConfig.folderToStore;
    } // console.log(pref_folderToStore)


    if (reviewConfig.foldersToIgnore != null) {
      // $FlowFixMe -- don't know how to make this array not just object
      pref_foldersToIgnore = reviewConfig.foldersToIgnore;
    } // console.log(pref_foldersToIgnore)


    if (reviewConfig.displayGroupedByFolder != null && typeof reviewConfig.displayGroupedByFolder === 'boolean') {
      pref_displayGroupedByFolder = reviewConfig.displayGroupedByFolder;
    } // console.log(pref_displayGroupedByFolder)


    if (reviewConfig.displayOrder != null && typeof reviewConfig.displayOrder === 'string') {
      pref_displayOrder = reviewConfig.displayOrder;
    } // console.log(pref_displayOrder)

  } //-------------------------------------------------------------------------------
  // Create human-readable lists of project notes for each tag of interest


  async function projectLists() {
    getConfig();
    console.log("\nprojectLists with pref_noteTypeTags = '".concat(pref_noteTypeTags, "':"));

    if (pref_noteTypeTags != null && pref_noteTypeTags !== '') {
      // We have defined tag(s) to filter and group by
      const tags = pref_noteTypeTags.split(',');

      for (const tag of tags) {
        // Do the main work
        const tagName = tag.slice(1); // remove leading # character

        const noteTitle = "'".concat(tagName, "' notes summary");
        const note = await returnSummaryNote(noteTitle, pref_folderToStore);

        if (note != null) {
          // Calculate the Summary list(s)
          const outputArray = makeNoteTypeSummary(tag);
          outputArray.unshift("# ".concat(noteTitle)); // Save the list(s) to this note

          console.log("\twriting results to the note with filename '".concat(note.filename, "'"));
          note.content = outputArray.join('\n');
          console.log("\twritten results to note '".concat(noteTitle, "'"));
        } else {
          showMessage$1('Oops: failed to find or make project summary note', 'OK');
          console.log("projectLists: error: shouldn't get here -- no valid note to write to");
          return;
        }
      }
    } else {
      // We will just use all notes with a @review() string, in one go     
      const noteTitle = "Review notes summary";
      const note = await returnSummaryNote(noteTitle, pref_folderToStore);

      if (note != null) {
        // Calculate the Summary list(s)
        const outputArray = makeNoteTypeSummary('');
        outputArray.unshift("# ".concat(noteTitle)); // Save the list(s) to this note

        console.log("\twriting results to the note with filename '".concat(note.filename, "'"));
        note.content = outputArray.join('\n');
        console.log("\twritten results to note '".concat(noteTitle, "'"));
      } else {
        showMessage$1('Oops: failed to find or make project summary note', 'OK');
        console.log("projectLists: error: shouldn't get here -- no valid note to write to");
        return;
      }
    }
  } //-------------------------------------------------------------------------------
  // Create machine-readable note listing project notes ready for review,
  // ordered by oldest next review date

  async function startReviews() {
    getConfig(); // Get or make _reviews note

    const reviewsNote = await returnSummaryNote(reviewListNoteTitle, pref_folderToStore);

    if (reviewsNote == null) {
      showMessage$1("Oops: failed to find or make _reviews note", 'OK');
      console.log("\nstartReviews: error: can't get or make summary _reviews note");
      return;
    }

    console.log("\nstartReviews:");
    const summaryArray = [];

    if (pref_noteTypeTags != null && pref_noteTypeTags !== '') {
      // We have defined tag(s) to filter and group by
      const tags = pref_noteTypeTags.split(',');

      for (const tag of tags) {
        // Read in all relevant notes, making Project objects
        const notes = findNotesMatchingHashtags(tag);
        const projectsReadyToReview = [];

        if (notes.length > 0) {
          // Get Project class representation of each note,
          // saving those which are ready for review in array
          for (const n of notes) {
            const np = new Project(n); // TODO: somewhere here ignore ones from certain folders

            if (np.isReadyForReview) {
              projectsReadyToReview.push(np);
            }
          }
        } // For each readyToReview note get the machine-readable summary line for it


        for (const np of projectsReadyToReview) {
          summaryArray.push(np.basicSummaryLine()); // console.log(np.basicSummaryLine())
        }
      }
    } else {
      // TODO: merge into the above if clause
      // We will just use all notes with a @review() string, in one go
      // Read in all relevant notes, making Project objects
      const notes = findNotesMatchingHashtags('');
      const projectsReadyToReview = [];

      if (notes.length > 0) {
        // Get Project class representation of each note,
        // saving those which are ready for review in array
        for (const n of notes) {
          const np = new Project(n); // TODO: somewhere here ignore ones from certain folders

          if (np.isReadyForReview) {
            projectsReadyToReview.push(np);
          }
        }
      } // For each readyToReview note get the machine-readable summary line for it


      for (const np of projectsReadyToReview) {
        summaryArray.push(np.basicSummaryLine()); // console.log(np.basicSummaryLine())
      }
    } // sort the list


    const outputArray = summaryArray.slice().sort( // $FlowIgnore[unsafe-addition]
    (first, second) => first.split('\t')[0] - second.split('\t')[0]); // order by first field
    // write summary to _reviews notes

    outputArray.push("```");
    outputArray.unshift("```");
    outputArray.unshift("---");
    outputArray.unshift("Last updated: ".concat(nowLocaleDateTime));
    outputArray.unshift("_NB: Do not edit manually. This is a machine-readable list of notes to review, used by `/start review` and `/next review` Plugin commands._");
    outputArray.unshift("# _reviews");
    reviewsNote.content = outputArray.join('\n');
    console.log("\twritten ".concat(summaryArray.length, " summary lines to note '").concat(reviewListNoteTitle, "'")); // Now trigger first review

    const noteToReview = await getNextNoteToReview(); // Open that note in editor

    if (noteToReview != null) {
      const res = await showMessageYesNo("Ready to review '".concat(displayTitle(noteToReview), "'?"), ['OK', 'Cancel']);

      if (res === 'OK') {
        Editor.openNoteByFilename(noteToReview.filename);
      }
    } else {
      console.log('🎉 No notes to review!');
      await showMessage$1('🎉 No notes to review!');
    }
  } //-------------------------------------------------------------------------------
  // Return summary of notes that contain a particular tag, for all
  // relevant folders

  function makeNoteTypeSummary(noteTag) {
    console.log("\nmakeNoteTypeSummary for '".concat(noteTag, "'"));
    let noteCount = 0;
    let overdue = 0;
    const outputArray = []; // if we want a summary broken down by folder, create list of folders
    // otherwise use a single folder

    const folderList = pref_displayGroupedByFolder ? DataStore.folders : ['/']; // console.log(`${folderList.length} folders`)
    // Iterate over the folders, ignoring any in the pref_foldersToIgnore list

    for (const folder of folderList) {
      if (pref_foldersToIgnore.includes(folder)) {
        continue;
      } // Get notes that include noteTag in this folder, ignoring subfolders


      const notes = findNotesMatchingHashtags(noteTag, folder, false);

      if (notes.length > 0) {
        // Create array of Project class representation of each note,
        // ignoring any marked as .isArchived
        const projects = []; // TODO: somewhere here ignore ones from certain folders

        for (const note of notes) {
          const np = new Project(note);

          if (!np.isArchived) {
            projects.push(np);
          }

          if (np.nextReviewDays != null && np.nextReviewDays < 0) {
            overdue += 1;
          }
        } // sort this array by key set in pref_displayOrder


        let sortedProjects = []; // NB: the Compare function needs to return negative, zero, or positive values. 

        switch (pref_displayOrder) {
          case 'due':
            {
              sortedProjects = projects.sort((first, second) => {
                var _first$dueDays, _second$dueDays;

                return ((_first$dueDays = first.dueDays) !== null && _first$dueDays !== void 0 ? _first$dueDays : 0) - ((_second$dueDays = second.dueDays) !== null && _second$dueDays !== void 0 ? _second$dueDays : 0);
              });
              break;
            }

          case 'review':
            {
              sortedProjects = projects.sort((first, second) => {
                var _first$nextReviewDays, _second$nextReviewDay;

                return ((_first$nextReviewDays = first.nextReviewDays) !== null && _first$nextReviewDays !== void 0 ? _first$nextReviewDays : 0) - ((_second$nextReviewDay = second.nextReviewDays) !== null && _second$nextReviewDay !== void 0 ? _second$nextReviewDay : 0);
              });
              break;
            }

          default:
            {
              sortedProjects = projects.sort((first, second) => {
                var _first$title, _second$title;

                return ((_first$title = first.title) !== null && _first$title !== void 0 ? _first$title : '').localeCompare((_second$title = second.title) !== null && _second$title !== void 0 ? _second$title : '');
              });
              break;
            }
        }

        if (pref_displayGroupedByFolder) {
          outputArray.push("### ".concat(folder, " (").concat(sortedProjects.length, " notes)"));
        } // iterate over this folder's notes, using Class functions


        for (const p of sortedProjects) {
          outputArray.push(p.detailedSummaryLine());
        }

        noteCount += sortedProjects.length;
      }
    } // Add summary/ies onto the start (remember: unshift adds to the very front each time)


    if (noteCount > 0) {
      outputArray.unshift("_Key:\tTitle\t# open / complete / waiting tasks / next review date / due date_");
    }

    outputArray.unshift("Total: **".concat(noteCount, " active notes**").concat(overdue > 0 ? ", ".concat(overdue, " ready for review") : ''));
    outputArray.unshift("Last updated: ".concat(nowLocaleDateTime));

    if (!pref_displayGroupedByFolder) {
      outputArray.unshift("### All folders (".concat(noteCount, " notes)"));
    }

    return outputArray;
  } //-------------------------------------------------------------------------------
  // Complete current review, then jump to the next one to review


  async function nextReview() {
    console.log('\nnextReview'); // First update @review(date) on current open note

    const openNote = await completeReview();

    if (openNote != null) {
      // Then update @review(date) in review list note
      await updateReviewListWithComplete(openNote);
    } // Read review list to work out what's the next one to review


    const noteToReview = await getNextNoteToReview(); // Offer to open that note in editor

    if (noteToReview != null) {
      const res = await showMessageYesNo("Ready to review '".concat(displayTitle(noteToReview), "'?"), ['OK', 'Cancel']);

      if (res === 'OK') {
        Editor.openNoteByFilename(noteToReview.filename);
      }
    } else {
      console.log('nextReview: 🎉 No more notes to review!');
      await showMessage$1('🎉 No more notes to review!');
    }
  } //-------------------------------------------------------------------------------
  // Update the review list after completing a review

  async function updateReviewListWithComplete(note) {
    var _note$title;

    const thisTitle = (_note$title = note.title) !== null && _note$title !== void 0 ? _note$title : '';
    console.log("updateReviewListWithComplete for '".concat(thisTitle, "'")); // Get note that contains the project list (or create if not found)

    const reviewNote = await returnSummaryNote(reviewListNoteTitle, pref_folderToStore);

    if (reviewNote == null) {
      showMessage$1("Oops: I now can't find summary note _reviews", 'OK');
      console.log("getNextNoteToReview: error: can't find summary note _reviews");
      return;
    } // Now read contents and parse, this time as paragraphs


    const paras = reviewNote.paragraphs;
    let inCodeblock = false;
    let lineNum = -1; // i.e. an invalid number

    for (let i = 1; i < paras.length; i++) {
      const pc = paras[i].content;

      if (pc.match('```')) {
        inCodeblock = !inCodeblock;
      } // toggle state


      if (pc.match(thisTitle) && inCodeblock) {
        // console.log(`\tFound '${thisTitle}' in line '${pc}' at line ${i}`)
        lineNum = i;
        break;
      }
    }

    if (lineNum >= 1) {
      console.log("\tRemove line ".concat(lineNum, " as its review is completed"));
      reviewNote.removeParagraph(paras[lineNum]);
    } else {
      console.log("\tWarning: _reviews' codeblock unexpectedly missing or empty");
      return;
    }
  } //-------------------------------------------------------------------------------
  // Work out the next note to review (if any)


  async function getNextNoteToReview() {
    var _note$content;

    console.log("\ngetNextNoteToReview"); // Get note that contains the project list (or create if not found)

    const note = await returnSummaryNote(reviewListNoteTitle, pref_folderToStore);

    if (note == null) {
      showMessage$1("Oops: I now can't find summary note _reviews", 'OK');
      console.log("getNextNoteToReview: error: can't find summary note _reviews");
      return;
    } // Now read contents and parse
    // Get first code block and read into array


    const firstCodeBlock = (_note$content = note.content) === null || _note$content === void 0 ? void 0 : _note$content.split('\n```')[1]; // console.log(firstCodeBlock)

    if (firstCodeBlock != null && firstCodeBlock !== '') {
      const firstCodeBlockLines = firstCodeBlock.split('\n');

      if (firstCodeBlockLines.length >= 1) {
        var _DataStore$projectNot;

        const nextNoteTitle = firstCodeBlockLines[1].split('\t')[1]; // ignore first line as it will be ```

        console.log("\tNext project note to review = '".concat(nextNoteTitle, "'"));
        const nextNotes = (_DataStore$projectNot = DataStore.projectNoteByTitle(nextNoteTitle, true, false)) !== null && _DataStore$projectNot !== void 0 ? _DataStore$projectNot : [];
        return nextNotes[0];
      } else {
        return;
      }
    } else {
      console.log("info: _reviews note codeblock was empty");
      return;
    }
  } //-------------------------------------------------------------------------------
  // Update the @reviewed(date) in the note in the Editor to today's date


  async function completeReview() {
    var _Editor$paragraphs, _Editor$note;

    const reviewMentionString = '@reviewed';
    const RE_REVIEW_MENTION = "".concat(reviewMentionString, "\\(").concat(RE_DATE, "\\)");
    const reviewedTodayString = "".concat(reviewMentionString, "(").concat(hyphenatedDate(new Date()), ")"); // TODO: Ideally add a check for project completion, and react accordingly
    // only proceed if we're in a valid Project note (with at least 2 lines)

    if (Editor.note == null || Editor.note.type === 'Calendar' || ((_Editor$paragraphs = Editor.paragraphs) === null || _Editor$paragraphs === void 0 ? void 0 : _Editor$paragraphs.length) < 2) {
      return;
    }

    let metadataPara; // get list of @mentions

    const firstReviewedMention = (_Editor$note = Editor.note) === null || _Editor$note === void 0 ? void 0 : _Editor$note.mentions.find(m => m.match(RE_REVIEW_MENTION));

    if (firstReviewedMention != null) {
      // find line in currently open note containing @reviewed() mention
      const firstMatch = firstReviewedMention; // which line is this in?

      for (const para of Editor.paragraphs) {
        if (para.content.match(RE_REVIEW_MENTION)) {
          metadataPara = para;
          console.log("\tFound existing ".concat(reviewMentionString, "(date) in line ").concat(para.lineIndex));
        }
      }

      if (metadataPara == null) {
        // If no metadataPara found, then insert one straight after the title
        console.log("\tCan't find an existing metadata line, so will insert a new second line for it");
        Editor.insertParagraph('', 1, 'empty');
        metadataPara = Editor.paragraphs[1];
      }

      const metaPara = metadataPara; // replace with today's date

      const older = metaPara.content;
      const newer = older.replace(firstMatch, reviewedTodayString);
      metaPara.content = newer;
      console.log("\tupdating para to '".concat(newer, "'")); // send update to Editor

      await Editor.updateParagraph(metaPara);
    } else {
      var _Editor$note2;

      // no existing mention, so append to note's default metadata line
      console.log("\tno matching ".concat(reviewMentionString, "(date) string found. Will append to line 1"));
      const metadataPara = (_Editor$note2 = Editor.note) === null || _Editor$note2 === void 0 ? void 0 : _Editor$note2.paragraphs[1];

      if (metadataPara == null) {
        return null;
      }

      const metaPara = metadataPara;
      metaPara.content += " ".concat(reviewedTodayString); // send update to Editor

      await Editor.updateParagraph(metaPara);
    } // return current note, to help next function


    return Editor.note;
  }

  exports.completeReview = completeReview;
  exports.nextReview = nextReview;
  exports.projectLists = projectLists;
  exports.startReviews = startReviews;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
Object.assign(globalThis, exports)
