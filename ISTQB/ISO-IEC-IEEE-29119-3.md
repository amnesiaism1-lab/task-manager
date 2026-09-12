#  INTERNATIONAL ISO/IEC/

# STANDARD IEEE 29119-3

First edition 2013-09-01

## Software and systems engineering — 

## Software testing — 

## Part 3: 

## Test documentation 

_Ingénierie du logiciel et des systèmes — Essais du logiciel —_ 

_Partie 3: Documentation des essais_ 

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALIAAAARCAYAAAB5AvYoAAABIUlEQVR4Xu3SQWrCQBTG8ex6huJCoWuhFe3aG9R1Nck5qhbJJGs9gnbT6LZg1GX1QO8I49NVmJdglYGp4fvgBxIYF4+/5/G01g+sC3CnmqeOPf5R0xh2v/tByFgVhpCxSgwhY5UYQsYqMRlylm31YvEFN0rTVe6+5fvdH/R8Lt+DtNnszPOZkyH33wf6qd6AG7WeX3L3Ld/H8FO8hWKBH5rnMydDHvR98Ufwd6/tTu6+5RuOJ+ItFAuD0DyfOYRsG0K2DyE7gJDtQ8gOIGT7ELIDCNk+hOwAQrYPITuAkO1DyA4gZPuuCfmR0QmHTPz4X+i99UipmKJI0Ww6o3W2o+/lipI4IcXfVBRT4AfinUsc8vmOl4zGE/EWinHI4n6G9AgUXLNnpZAo7wAAAABJRU5ErkJggg==)

![](data:image/png;base64,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)

Reference number ISO/IEC/IEEE 29119-3:2013(E)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKoAAAALCAYAAADvNhbJAAAAyUlEQVR4Xu3SQQqCQBTGcWnfpgtUuDK1TqJ1hiIq6QpFN2rdoUbGVs1sXjNROTgVhgoK3we/5ds8/o6jRkRjhWszP+TucAQlhZ7PhZSP3/0SRwvrFnIsTa2fGc66Ux2qS89N/YDUIZQUeBO6CfF639fF0dy6hRxjrPgycxeEWhFCrQdCbRhCrQdCbZgOVSDUyv4OdZfsablaQ0mbbUJSSuOnn3c4nqxbyGXZtfgyc3aoGNbCIVSsE0OoWCeGULFO7B1qTxkAtFT/Dk82nEBOhDOoAAAAAElFTkSuQmCC)

![](data:image/jpeg;base64,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)

© ISO/IEC 2013

 © IEEE 2013 

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCABDAEwDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKZPLHBDJNM6pHGpZ2Y4CgDJJp9fP8A+2T8RT4f8Jp4O0ucrqWsr/pBQ/NFbZwR9XPH0zQB5D8TPiz8QPGvjTVbzwVq+p2WiaOC8SWcpjBjU4Mr4+9k84Pavo/9m/4kf8LE8CJPeyJ/bNgRBfqBjcf4ZAPRh+ua85+B/geLwv4GWO/t1N/qaeZeKw6KRxGfoDz7mvNtE1C7+Bfx2SbMn/CP6idso7PbO3X/AHo2/l70wPt6io7aeG5t4ri3kWWGVA8bqchlIyCPYipKQBRRRQAUUUUAZ/iTWLHw/oN7rOoyiK1s4WlkYnsB0+pr4y+Htte/Fv4x6h4412Mvp9pMJVjYZUsP9TEPYAAke3vXcftleObjUdSsfhloLmWeV0kvlQ9Wb/Vxn/0I/hXX/DXwvb+EPCVno8IBlVd9w+OXlP3j/T8KaAx/F3xa8HeGtZbSr67nmukOJhBEXER/2j6+1UfitoGnfEv4brqGhyx3VzbqbnT5U/j4+eM/UDp6gV8z/EG3ktPHWvW8rMzpqE2WY5J+ckH9a+kP2YIJIfhbFI7Eia8mdAewyBx+INAWsdB+xr8QzrXhiTwVqsx/tHSR/o28/M8Gfu/VTx9MV9CV8SfE20vvhZ8WNP8AHuhRslncz+ZIi8Lu/wCWiH2Yc19keFNcsPEvhyx13TJRLaXsKyxsPcdD7g8UgNOiiigArmfij4wsfAngjUfEl9hhbR4gizgzSnhEH1P6ZNdNXx1+0x4ovfiV8U7D4eeHpfMs7Kfy3ZTlGm/jc+yLn9aAKX7PWgX3ifxXqPxH8QkzyvO7Qu44eZuWYeyg4H4elfQFZ3hrR7Lw/oNno2npttrSIIvqx7sfcnJrRpiPjz4/2f2L4sayAMLMyTD/AIEgz+oNfSPwUszY/C3QYWGC1qJD/wACJb+teK/tUaXMPiBYXMULkXtosakL95wxGB78ivozw3afYPD2nWWNvkW0cePTCigb2M/4heGbbxd4TvdFnCh5V3QOf4JByp/OuF/Y78cXOh6/ffC3xCzRMZXew8w/clH+si/HG4e4PrXrVeCftH+GrvRtZsPiPoJaGeGaMXTR8FJFP7uT8cbT+HrQxI+zaK5D4P8AjW08feA7DX4CondPLu4gf9XMPvD6dx9a6+kM83/aJ8fx+APh5dXkMgGp3gNvYrnneRy30Uc14b+zL4QktNOuPGWqKzX2o5W3Z+WWInLN9WP6CuP+PPjG28b/ABxkstau3svD+j3TWYG0tgI2JGwO7MCPpivULT4wfDa0tYrW31V44YkCIotmwFAwBTBnpFFeef8AC6Ph5/0GJf8AwHaj/hdHw8/6DEv/AIDtQI4r43/FTXPDnjZNG0yw0/yrNElZ7q3ErSMwz8pP3R2yOa9l8K6o2teG9O1doDbtd26SmM/wkjOK808QeO/gx4gu4bvWfKvJ4PuPJavkD09xWzF8ZPhzFGscerOiKMKq2zAAegoA9FqnrWm2msaTd6XfxCW1uomikU9wR/PvXEf8Lo+Hn/QYl/8AAdqP+F0fDz/oMS/+A7UAcR8AfEV38JvjDeeCdbmI0rUZREsjcLvP+qkH1HBr7MByMivhf4+eJfA3i6xtdT0PVGOsWjBQPJZDJH9fUHkV9H/s4/EYeLfhfZ3Wquw1CykayuHwT5jIqkP+Ksv45pDMz4rfCrwBqnih9VvfDsLXl2DJcSRzyxeY394hGAz745rkv+FO/DjH/Iuf+Ttx/wDHKKKYg/4U78OP+hc/8nbj/wCOUf8ACnfhx/0Ln/k7cf8AxyiigLgfg78OP+hc/wDJ24/+OUf8Kd+HH/Quf+Ttx/8AHKKKAuA+Dvw4/wChc/8AJ24/+OUH4O/Dj/oXP/J24/8AjlFFAXD/AIU78OP+hc/8nbj/AOOV7r8PPC3h/wALeFbbTNB0yGxtD+9KKSxZ2AyxZiSScDqewoooYH//2Q==)

###  COPYRIGHT PROTECTED DOCUMENT 

© ISO/IEC 2013 © IEEE 2013 

All rights reserved. Unless otherwise specified, no part of this publication may be reproduced or utilized in any form or by any means, electronic or mechanical, including photocopying and microfilm, without permission in writing from ISO, IEC or IEEE at the respective address below. 

ISO copyright office IEC Central Office Institute of Electrical and Electronics Engineers, Inc. Case postale 56 3, rue de Varembé 3 Park Avenue, New York 

CH-1211 Geneva 20 CH-1211 Geneva 20 NY 10016-5997, USA Tel. + 41 22 749 01 11 Switzerland E-mail stds.ipr@ieee.org 

Fax + 41 22 749 09 47 E-mail inmail@iec.ch Web www.ieee.org E-mail copyright@iso.org Web www.iec.ch 

Web www.iso.org Published in Switzerland 

© ISO/IEC 2013 – All rights reserved

### ii © IEEE 2013 – All rights reserved 

# Contents Page 

| **Contents** Page  |  |
| --- | ---: |
| [**Foreword**](#foreword) | [**vii**](#foreword) |
| [**Introduction**](#introduction) | [**viii**](#introduction) |
| [**1 Scope**](#1-scope) | [**1**](#1-scope) |
| [**2 Conformance**](#2-conformance) | [**3**](#2-conformance) |
| [**2.1 Intended Usage**](#2-conformance) | [**3**](#2-conformance) |
| [**2.2 Types of conformance**](#22-types-of-conformance) | [**3**](#22-types-of-conformance) |
| [**2.2.1 Full Conformance**](#221-full-conformance) | [**3**](#221-full-conformance) |
| [**2.2.2 Tailored Conformance**](#222-tailored-conformance) | [**3**](#222-tailored-conformance) |
| [**3 Normative References**](#3-normative-references) | [**4**](#3-normative-references) |
| [**4 Terms and Definitions**](#3-normative-references) | [**4**](#3-normative-references) |
| [**5 Organizational Test Process Documentation**](#5-organizational-test-process-documentation) | [**9**](#5-organizational-test-process-documentation) |
| [**5.1 Overview**](#51-overview) | [**9**](#51-overview) |
| [**5.2 Test Policy**](#5-organizational-test-process-documentation) | [**9**](#5-organizational-test-process-documentation) |
| [**5.2.1 Overview**](#521-overview) | [**9**](#521-overview) |
| [**5.2.2 Document specific information**](#522-document-specific-information) | [**9**](#522-document-specific-information) |
| [**5.2.3 Introduction**](#523-introduction) | [**10**](#523-introduction) |
| [**5.2.4 Test policy statements**](#524-test-policy-statements) | [**10**](#524-test-policy-statements) |
| [**5.3 Organizational Test Strategy**](#53-organizational-test-strategy) | [**11**](#53-organizational-test-strategy) |
| [**5.4 Overview**](#5246-standards) | [**11**](#5246-standards) |
| [**5.4.1 Document specific information**](#532-document-specific-information) | [**12**](#532-document-specific-information) |
| [**5.4.2 Introduction**](#5325-change-history) | [**13**](#5325-change-history) |
| [**5.4.3 Project-wide organizational test strategy statements**](#5325-change-history) | [**13**](#5325-change-history) |
| [**5.4.4 Test sub-process-specific organizational test strategy statements**](#5344-test-automation-and-tools) | [**14**](#5344-test-automation-and-tools) |
| [**6 Test Management Processes Documentation**](#6-test-management-processes-documentation) | [**15**](#6-test-management-processes-documentation) |
| [**6.1 Overview**](#61-overview) | [**15**](#61-overview) |
| [**6.2 Test Plan**](#62-test-plan) | [**15**](#62-test-plan) |
| [**6.2.1 Overview**](#621-overview) | [**15**](#621-overview) |
| [**6.2.2 Document specific information**](#622-document-specific-information) | [**16**](#622-document-specific-information) |
| [**6.2.3 Introduction**](#623-introduction) | [**16**](#623-introduction) |
| [**6.2.4 Context of the testing**](#624-context-of-the-testing) | [**17**](#624-context-of-the-testing) |
| [**6.2.5 Testing communication**](#625-testing-communication) | [**17**](#625-testing-communication) |
| [**6.2.6 Risk register**](#626-risk-register-identifies-the-risks-considered-by-the-testing-covered-by-this-plan-this-should-include-any-relevant-risks-that-may-be-specified-in-the-organizational-test-strategy-provides-an-exposure-level-for-each-risk-based-on-its-impact-and-probability-provides-recommendations-to-treat-the-risks-this-section-may-reference-where-a-separate-risk-register-can-be-found) | [**18**](#626-risk-register-identifies-the-risks-considered-by-the-testing-covered-by-this-plan-this-should-include-any-relevant-risks-that-may-be-specified-in-the-organizational-test-strategy-provides-an-exposure-level-for-each-risk-based-on-its-impact-and-probability-provides-recommendations-to-treat-the-risks-this-section-may-reference-where-a-separate-risk-register-can-be-found) |
| [**6.2.7 Test strategy**](#626-risk-register-identifies-the-risks-considered-by-the-testing-covered-by-this-plan-this-should-include-any-relevant-risks-that-may-be-specified-in-the-organizational-test-strategy-provides-an-exposure-level-for-each-risk-based-on-its-impact-and-probability-provides-recommendations-to-treat-the-risks-this-section-may-reference-where-a-separate-risk-register-can-be-found) | [**18**](#626-risk-register-identifies-the-risks-considered-by-the-testing-covered-by-this-plan-this-should-include-any-relevant-risks-that-may-be-specified-in-the-organizational-test-strategy-provides-an-exposure-level-for-each-risk-based-on-its-impact-and-probability-provides-recommendations-to-treat-the-risks-this-section-may-reference-where-a-separate-risk-register-can-be-found) |
| [**6.2.8 Testing activities and estimates**](#628-testing-activities-and-estimates) | [**20**](#628-testing-activities-and-estimates) |
| [**6.2.9 Staffing**](#629-staffing) | [**20**](#629-staffing) |
| [**6.2.10 Schedule**](#6210-schedule) | [**20**](#6210-schedule) |
| [**6.3 Test Status Report**](#63-test-status-report) | [**21**](#63-test-status-report) |
| [**6.3.1 Overview**](#631-overview) | [**21**](#631-overview) |
| [**6.3.2 Document specific information**](#632-document-specific-information) | [**21**](#632-document-specific-information) |
| [**6.3.3 Introduction**](#633-introduction) | [**21**](#633-introduction) |
| [**6.3.4 Test status**](#634-test-status) | [**22**](#634-test-status) |
| [**6.4 Test Completion Report**](#64-test-completion-report) | [**23**](#64-test-completion-report) |
| [**6.4.1 Overview**](#641-overview) | [**23**](#641-overview) |
| [**6.4.2 Document specific information**](#642-document-specific-information) | [**23**](#642-document-specific-information) |
| [**6.4.3 Introduction**](#643-introduction) | [**23**](#643-introduction) |
| [**6.4.4 Testing performed**](#644-testing-performed) | [**24**](#644-testing-performed) |
| [**7 Dynamic Test Processes Documentation**](#7-dynamic-test-processes-documentation) | [**25**](#7-dynamic-test-processes-documentation) |
| [**7.1 Overview**](#71-overview) | [**25**](#71-overview) |
| [**7.2 Test Design Specification**](#72-test-design-specification) | [**26**](#72-test-design-specification) |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved iii

|  |  |
| --- | ---: |
| [**7.2.1 Overview**](#721-overview) | [**26**](#721-overview) |
| [**7.2.2 Document specific information**](#722-document-specific-information) | [**26**](#722-document-specific-information) |
| [**7.2.3 Introduction**](#723-introduction) | [**26**](#723-introduction) |
| [**7.2.4 Feature sets**](#724-feature-sets) | [**27**](#724-feature-sets) |
| [**7.2.5 Test conditions**](#725-test-conditions) | [**28**](#725-test-conditions) |
| [**7.3 Test Case Specification**](#73-test-case-specification) | [**29**](#73-test-case-specification) |
| [**7.3.1 Overview**](#731-overview) | [**29**](#731-overview) |
| [**7.3.2 Document specific information**](#732-document-specific-information) | [**29**](#732-document-specific-information) |
| [**7.3.3 Introduction**](#733-introduction) | [**29**](#733-introduction) |
| [**7.3.4 Test coverage items**](#734-test-coverage-items) | [**30**](#734-test-coverage-items) |
| [**7.3.5 Test cases**](#735-test-cases) | [**31**](#735-test-cases) |
| [**7.4 Test Procedure Specification**](#74-test-procedure-specification) | [**32**](#74-test-procedure-specification) |
| [**7.4.1 Overview**](#741-overview) | [**32**](#741-overview) |
| [**7.4.2 Document specific information**](#742-document-specific-information) | [**33**](#742-document-specific-information) |
| [**7.4.3 Introduction**](#743-introduction) | [**33**](#743-introduction) |
| [**7.4.4 Test sets**](#744-test-sets) | [**34**](#744-test-sets) |
| [**7.4.5 Test procedures**](#745-test-procedures) | [**34**](#745-test-procedures) |
| [**7.5 Test Data Requirements**](#75-test-data-requirements) | [**35**](#75-test-data-requirements) |
| [**7.5.1 Overview**](#751-overview) | [**35**](#751-overview) |
| [**7.5.2 Document specific information**](#752-document-specific-information) | [**36**](#752-document-specific-information) |
| [**7.5.3 Introduction**](#753-introduction) | [**36**](#753-introduction) |
| [**7.5.4 Detailed test data requirements**](#754-detailed-test-data-requirements) | [**37**](#754-detailed-test-data-requirements) |
| [**7.6 Test Environment Requirements**](#76-test-environment-requirements) | [**38**](#76-test-environment-requirements) |
| [**7.6.1 Overview**](#761-overview) | [**38**](#761-overview) |
| [**7.6.2 Document specific information**](#762-document-specific-information) | [**38**](#762-document-specific-information) |
| [**7.6.3 Introduction**](#763-introduction) | [**38**](#763-introduction) |
| [**7.6.4 Detailed test environment requirements**](#764-detailed-test-environment-requirements) | [**39**](#764-detailed-test-environment-requirements) |
| [**7.7 Test Data Readiness Report**](#77-test-data-readiness-report) | [**40**](#77-test-data-readiness-report) |
| [**7.7.1 Overview**](#771-overview) | [**40**](#771-overview) |
| [**7.7.2 Document specific information**](#772-document-specific-information) | [**40**](#772-document-specific-information) |
| [**7.7.3 Introduction**](#773-introduction) | [**41**](#773-introduction) |
| [**7.7.4 Test data status**](#774-test-data-status) | [**41**](#774-test-data-status) |
| [**7.8 Test Environment Readiness Report**](#78-test-environment-readiness-report) | [**41**](#78-test-environment-readiness-report) |
| [**7.8.1 Overview**](#781-overview) | [**41**](#781-overview) |
| [**7.8.2 Document specific information**](#782-document-specific-information) | [**42**](#782-document-specific-information) |
| [**7.8.3 Introduction**](#783-introduction) | [**42**](#783-introduction) |
| [**7.8.4 Test environment readiness**](#784-test-environment-readiness) | [**43**](#784-test-environment-readiness) |
| [**7.9 Actual Results**](#79-actual-results) | [**43**](#79-actual-results) |
| [**7.10 Test Result**](#710-test-result) | [**43**](#710-test-result) |
| [**7.11 Test Execution Log**](#711-test-execution-log) | [**44**](#711-test-execution-log) |
| [**7.11.1 Overview**](#7111-overview) | [**44**](#7111-overview) |
| [**7.11.2 Document specific information**](#7112-document-specific-information) | [**44**](#7112-document-specific-information) |
| [**7.11.3 Introduction**](#7113-introduction) | [**44**](#7113-introduction) |
| [**7.11.4 Events**](#7114-events) | [**45**](#7114-events) |
| [**7.12 Test Incident Reporting**](#712-test-incident-reporting) | [**45**](#712-test-incident-reporting) |
| [**7.12.1 Overview**](#7121-overview) | [**45**](#7121-overview) |
| [**7.12.2 Incident Report**](#7122-incident-report) | [**46**](#7122-incident-report) |
| [**7.12.3 Document specific information**](#7123-document-specific-information) | [**46**](#7123-document-specific-information) |
| [**7.12.4 Introduction**](#7124-introduction) | [**46**](#7124-introduction) |
| [**7.12.5 Incident details**](#7125-incident-details) | [**47**](#7125-incident-details) |
| [**Annex A**](#annex-a-informative)[ (informative) ](#annex-a-informative)[**Overview and Outlines of Documents**](#annex-a-informative) | [**49**](#annex-a-informative) |
| [**A.1 Overview**](#a1-overview) | [**49**](#a1-overview) |
| [**A.2 Document Outlines**](#a2-document-outlines) | [**50**](#a2-document-outlines) |
| [**A.2.1 Overview**](#a2-document-outlines) | [**50**](#a2-document-outlines) |
| **A.2.2 Organizational Test Policy** | **51** |
| **A.2.3 Organizational Test Strategy** | **51** |
| **A.2.4 Test Plan** | **52** |
| **A.2.5 Test Status Report** | **53** |
| **A.2.6 Test Completion Report** | **53** |

© ISO/IEC 2013 – All rights reserved

iv © IEEE 2013 – All rights reserved 

|  |  |
| --- | ---: |
| **A.2.7 Test Design Specification** | **54** |
| **A.2.8 Test Case Specification** | **54** |
| **A.2.9 Test Procedure Specification** | **55** |
| **A.2.10 Test Data Requirements** | **55** |
| **A.2.11 Test Environment Requirements** | **56** |
| **A.2.12 Test Data Readiness Report** | **56** |
| **A.2.13 Test Environment Readiness Report** | **56** |
| **A.2.14 Test Execution Log** | **56** |
| **A.2.15 Incident Report** | **56** |
| [**Annex B**](#annex-b-informative)[ (informative) ](#annex-b-informative)[**ISO/IEC/IEEE 29119-2 Normative Requirements Mapped to ISO/IEC/IEEE 29119-3 Information Items**](#annex-b-informative) | [**58**](#annex-b-informative) |
| [**B.1 Mapping**](#b1-mapping) | [**58**](#b1-mapping) |
| [**B.1.1 Organizational Test Policy**](#annex-b-informative) | [**58**](#annex-b-informative) |
| [**B.1.2 Organizational Test Strategy**](#annex-b-informative) | [**58**](#annex-b-informative) |
| **B.1.3 Test Plan** | **59** |
| **B.1.4 Test Status Report** | **59** |
| **B.1.5 Test Completion Report** | **60** |
| **B.1.6 Test Design Specification** | **60** |
| **B.1.7 Test Case Specification** | **60** |
| **B.1.8 Test Procedure Specification** | **60** |
| **B.1.9 Test Data Requirements** | **61** |
| **B.1.10 Test Environment Requirements** | **61** |
| **B.1.11 Test Data Readiness Report** | **61** |
| **B.1.12 Test Environment Readiness Report** | **61** |
| **B.1.13 Test Execution Log** | **61** |
| **B.1.14 Incident Report** | **61** |
| [**Annex C**](#annex-c-informative)[ (informative) ](#annex-c-informative)[**Overview of Examples**](#annex-c-informative) | [**63**](#annex-c-informative) |
| [**C.1 Overview**](#c1-overview) | [**63**](#c1-overview) |
| [**Annex D**](#annex-d-informative)[ (informative) ](#annex-d-informative)[**Test Policy**](#annex-d-informative) | [**65**](#annex-d-informative) |
| [**D.1 Example 1 – Agile Corporation**](#d1-example-1--agile-corporation) | [**65**](#d1-example-1--agile-corporation) |
| [**D.2 Example 2 – Traditional Ltd**](#d2-example-2--traditional-ltd) | [**65**](#d2-example-2--traditional-ltd) |
| [**Annex E**](#annex-e-informative)[ (informative) ](#annex-e-informative)[**Organizational Test Strategy**](#annex-e-informative) | [**67**](#annex-e-informative) |
| [**E.1 Example 1 – Agile Corporation**](#e1-example-1--agile-corporation) | [**67**](#e1-example-1--agile-corporation) |
| [**E.2 Example 2 – Traditional Ltd**](#e2-example-2--traditional-ltd) | [**68**](#e2-example-2--traditional-ltd) |
| [**Annex F**](#annex-f-informative)[ (informative) ](#annex-f-informative)[**Test Plan**](#annex-f-informative) | [**72**](#annex-f-informative) |
| [**F.1 Example 1 – Agile Corporation**](#f1-example-1--agile-corporation) | [**72**](#f1-example-1--agile-corporation) |
| **F.2 Example 2 – Traditional Ltd** | **73** |
| [**F.2.1 Project Test Plan**](#uvtit-14-33a-projectsystem-test-plan) | [**74**](#uvtit-14-33a-projectsystem-test-plan) |
| [**F.2.2 System Test Plan**](#uvtit14-33a-pc-part-system-test-plan) | [**80**](#uvtit14-33a-pc-part-system-test-plan) |
| [**Annex G**](#annex-g-informative)[ (informative) ](#annex-g-informative)[**Test Status Report**](#annex-g-informative) | [**85**](#annex-g-informative) |
| [**G.1 Example 1 – Agile Corporation**](#g1-example-1--agile-corporation) | [**85**](#g1-example-1--agile-corporation) |
| [**G.2 Example 2 – Traditional Ltd**](#g2-example-2--traditional-ltd) | [**85**](#g2-example-2--traditional-ltd) |
| [**Annex H**](#annex-h-informative)[ (informative) ](#annex-h-informative)[**Test Completion Report**](#annex-h-informative) | [**88**](#annex-h-informative) |
| [**H.1 Example 1 – Agile Corporation**](#h1-example-1--agile-corporation) | [**88**](#h1-example-1--agile-corporation) |
| [**H.2 Example 2 – Traditional Ltd**](#h2-example-2--traditional-ltd) | [**89**](#h2-example-2--traditional-ltd) |
| [**Annex I**](#annex-i-informative)[ (informative) ](#annex-i-informative)[**Test Design Specification**](#annex-i-informative) | [**91**](#annex-i-informative) |
| [**I.1**](#i1-example-1--agile-corporation)[ ](#i1-example-1--agile-corporation)[**Example 1 – Agile Corporation**](#i1-example-1--agile-corporation) | [**91**](#i1-example-1--agile-corporation) |
| [**I.2 Example 2 – Traditional Ltd**](#i2-example-2--traditional-ltd) | [**91**](#i2-example-2--traditional-ltd) |
| [**Annex J**](#annex-j-informative)[ (informative) ](#annex-j-informative)[**Test Case Specification**](#annex-j-informative) | [**99**](#annex-j-informative) |
| [**J.1 Example 1 – Agile Corporation**](#j1-example-1--agile-corporation) | [**99**](#j1-example-1--agile-corporation) |
| [**J.2 Example 2 – Traditional Ltd**](#j2-example-2--traditional-ltd) | [**99**](#j2-example-2--traditional-ltd) |
| [**Annex K**](#annex-k-informative)[ (informative) ](#annex-k-informative)[**Test Procedure Specification**](#annex-k-informative) | [**104**](#annex-k-informative) |
| [**K.1.1 Example 1.1 – Agile Corporation**](#annex-k-informative) | [**104**](#annex-k-informative) |
| [**K.1.2 Example 1.2 – Agile Corporation**](#annex-k-informative) | [**104**](#annex-k-informative) |
| [**K.2 Example 2 – Traditional Ltd**](#k2-example-2--traditional-ltd) | [**105**](#k2-example-2--traditional-ltd) |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved v

|  |  |
| --- | ---: |
| [**Annex L**](#annex-l-informative)[ (informative) ](#annex-l-informative)[**Test Data Requirements**](#annex-l-informative) | [**107**](#annex-l-informative) |
| [**L.1 Example 1 – Agile Corporation**](#l1-example-1--agile-corporation) | [**107**](#l1-example-1--agile-corporation) |
| [**L.2 Example 2 – Traditional Ltd**](#l2-example-2--traditional-ltd) | [**107**](#l2-example-2--traditional-ltd) |
| [**Annex M**](#annex-m-informative)[ (informative) ](#annex-m-informative)[**Test Environment Requirements**](#annex-m-informative) | [**109**](#annex-m-informative) |
| [**M.1 Example 1 – Agile Corporation**](#m1-example-1--agile-corporation) | [**109**](#m1-example-1--agile-corporation) |
| [**M.2 Example – Traditional Ltd**](#m2-example--traditional-ltd) | [**109**](#m2-example--traditional-ltd) |
| [**Annex N**](#annex-n-informative)[ (informative) ](#annex-n-informative)[**Test Data Readiness Report**](#annex-n-informative) | [**111**](#annex-n-informative) |
| [**N.1 Example 1 – Agile Corporation**](#n1-example-1--agile-corporation) | [**111**](#n1-example-1--agile-corporation) |
| [**N.2 Example 2 – Traditional Ltd**](#n2-example-2--traditional-ltd) | [**111**](#n2-example-2--traditional-ltd) |
| [**Annex O**](#annex-o-informative)[ (informative) ](#annex-o-informative)[**Test Environment Readiness Report**](#annex-o-informative) | [**112**](#annex-o-informative) |
| [**O.1 Example 1 – Agile Corporation**](#o1-example-1--agile-corporation) | [**112**](#o1-example-1--agile-corporation) |
| [**O.2 Example 2 – Traditional Ltd**](#o2-example-2--traditional-ltd) | [**112**](#o2-example-2--traditional-ltd) |
| [**Annex P**](#annex-p-informative)[ (informative) ](#annex-p-informative)[**Actual Results**](#annex-p-informative) | [**113**](#annex-p-informative) |
| [**P.1 Example 1 – Agile Corporation**](#p1-example-1--agile-corporation) | [**113**](#p1-example-1--agile-corporation) |
| [**P.2 Example 2 – Traditional**](#p2-example-2--traditional) | [**114**](#p2-example-2--traditional) |
| [**Annex Q**](#annex-q-informative)[ (informative) ](#annex-q-informative)[**Test Result**](#annex-q-informative) | [**115**](#annex-q-informative) |
| [**Q.1 Example 1 – Agile Corporation**](#q1-example-1--agile-corporation) | [**115**](#q1-example-1--agile-corporation) |
| [**Q.2 Example 2 – Traditional Ltd**](#q2-example-2--traditional-ltd) | [**116**](#q2-example-2--traditional-ltd) |
| [**Annex R**](#annex-r-informative)[ (informative) ](#annex-r-informative)[**Test Execution Log**](#annex-r-informative) | [**117**](#annex-r-informative) |
| [**R.1 Example 1 – Agile Corporation**](#r1-example-1--agile-corporation) | [**117**](#r1-example-1--agile-corporation) |
| [**R.2 Example 2 – Traditional Ltd**](#r2-example-2--traditional-ltd) | [**117**](#r2-example-2--traditional-ltd) |
| [**Annex S**](#annex-s-informative)[ (informative) ](#annex-s-informative)[**Incident Report**](#annex-s-informative) | [**118**](#annex-s-informative) |
| [**S.1 Example 1 – Agile Corporation**](#s1-example-1--agile-corporation) | [**118**](#s1-example-1--agile-corporation) |
| [**S.2 Example 2 – Traditional Ltd**](#s2-example-2--traditional-ltd) | [**119**](#s2-example-2--traditional-ltd) |
| [**Annex T**](#annex-t-informative)[ (informative) ](#annex-t-informative)[**Mappings to Existing Standards**](#annex-t-informative) | [**120**](#annex-t-informative) |
| [**T.1 Mapping to IEEE 829:2008**](#t1-mapping-to-ieee-8292008) | [**120**](#t1-mapping-to-ieee-8292008) |
| [**T.2 Mapping to ISO/IEC FDIS 15289: 2011**](#t2-mapping-to-isoiec-15289-2011) | [**125**](#t2-mapping-to-isoiec-15289-2011) |
| [**T.3 Mapping to BS 7925-2:1998**](#t3-mapping-to-bs-7925-21998) | [**126**](#t3-mapping-to-bs-7925-21998) |
| [**T.4 Mapping to ISO/IEC 25051:2006**](#t4-mapping-to-isoiec-250512006) | [**126**](#t4-mapping-to-isoiec-250512006) |
| [**Bibliography**](#bibliography) | [**127**](#bibliography) |

© ISO/IEC 2013 – All rights reserved

vi © IEEE 2013 – All rights reserved 

# Foreword 

ISO (the International Organization for Standardization) and IEC (the International Electrotechnical Commission) form the specialized system for worldwide standardization. National bodies that are members of ISO or IEC participate in the development of International Standards through technical committees established by the respective organization to deal with particular fields of technical activity. ISO and IEC technical committees collaborate in fields of mutual interest. Other international organizations, governmental and non- governmental, in liaison with ISO and IEC, also take part in the work. In the field of information technology, ISO and IEC have established a joint technical committee, ISO/IEC JTC 1. 

IEEE Standards documents are developed within the IEEE Societies and the Standards Coordinating Committees of the IEEE Standards Association (IEEE-SA) Standards Board. The IEEE develops its standards through a consensus development process, approved by the American National Standards Institute, which brings together volunteers representing varied viewpoints and interests to achieve the final product. Volunteers are not necessarily members of the Institute and serve without compensation. While the IEEE administers the process and establishes rules to promote fairness in the consensus development process, the IEEE does not independently evaluate, test, or verify the accuracy of any of the information contained in its standards. 

International Standards are drafted in accordance with the rules given in the ISO/IEC Directives, Part 2. 

The main task of ISO/IEC JTC 1 is to prepare International Standards. Draft International Standards adopted by the joint technical committee are circulated to national bodies for voting. Publication as an International Standard requires approval by at least 75 % of the national bodies casting a vote. 

Attention is called to the possibility that implementation of this standard may require the use of subject matter covered by patent rights. By publication of this standard, no position is taken with respect to the existence or validity of any patent rights in connection therewith. ISO/IEEE is not responsible for identifying essential patents or patent claims for which a license may be required, for conducting inquiries into the legal validity or scope of patents or patent claims or determining whether any licensing terms or conditions provided in connection with submission of a Letter of Assurance or a Patent Statement and Licensing Declaration Form, if any, or in any licensing agreements are reasonable or non-discriminatory. Users of this standard are expressly advised that determination of the validity of any patent rights, and the risk of infringement of such rights, is entirely their own responsibility. Further information may be obtained from ISO or the IEEE Standards Association. 

ISO/IEC/IEEE 29119-3 was prepared by Joint Technical Committee ISO/IEC JTC 1, _Information technology_, Subcommittee SC 7, _Software and systems engineering_, in cooperation with the Software & Systems Engineering Standards Committee of the IEEE Computer Society, under the Partner Standards Development Organization cooperation agreement between ISO and IEEE. 

ISO/IEC 29119 consists of the following standards, under the general title _Software and systems engineering — Software testing_: 

 _Part 1: Concepts and definitions_ 

 _Part 2: Test processes_ 

 _Part 3: Test documentation_ 

 _Part 4: Test techniques_ 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved vii

# Introduction 

The purpose of the ISO/IEC/IEEE 29119 series of software testing standards is to define an internationally- agreed set of standards for software testing that can be used by any organization when performing any form of software testing. 

This part of ISO/IEC/IEEE 29119, Test Documentation, includes templates and examples of test documentation that are produced during the test process. The templates are arranged within clauses reflecting the overall test process description structure in ISO/IEC/IEEE 29119-2 Test Processes, i.e. by the test process in which they are being produced. Annex A contains outlines of the contents of each document. Annex B contains a list of all the information items identified in Clauses 5, 6 and 7 of this part of ISO/IEC/IEEE 29119 with the corresponding level of conformance (shall/should/may) from ISO/IEC/IEEE 29119-2 Test Processes. [Annex C c](#annex-c-informative)ontains an overview of the examples. Annexes D to S contain examples of the application of the templates. Annex T provides mappings to existing standards. The Bibliography for this part of ISO/IEC/IEEE 29119 is at the end of the document. 

The concepts and vocabulary relating to the software testing documentation are defined in ISO/IEC/IEEE 29119-1 Concepts and Definitions. 

The actual test process model is defined in ISO/IEC/IEEE 29119-2 Test Processes. It comprises test process descriptions that define the software testing processes at the organizational level, test management level and dynamic test level. Supporting informative diagrams describing the processes are also provided. 

Software test design techniques that can be used during test design are defined in ISO/IEC/IEEE 29119-4 Test Techniques. 

This series of international standards aims to provide stakeholders with the ability to manage and perform software testing in any organization. 

© ISO/IEC 2013 – All rights reserved

viii © IEEE 2013 – All rights reserved 

**INTERNATIONAL STANDARD ISO/IEC/IEEE 29119-3:2013(E)**

## Software and systems engineering — Software testing — 

## Part 3: Test documentation 

# 1 Scope 

This part of ISO/IEC/IEEE 29119 specifies software test documentation templates that can be used by any organization, project or smaller testing activity. It describes the test documentation that is an output of the processes specified in ISO/IEC/IEEE 29119-2 Test Processes. An overview of the documents is provided in [Figure 1 b](#test-policy-found-in-clause-52)elow. A slightly larger version of this figure is provided in [Annex A. ](#annex-a-informative)

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **1**

**Organizational Test Documentation**

### Test Policy Found in clause 5.2

Organizational Organizational

## Test Strategy … Test Strategy 5.3

**Test Management Documentation**

|  | Test Plan | Test Plan |  | Test Plan |  |
| ---: | --- | --- | --- | --- | ---: |
|  | (Project) **…** | (Project) | **…** | (Project) | 6.2 |
| **…** | **…** | **…** | **…** | **…** | **…** |
|  | Test Plan(Sub-process) **…** | Test Plan(Sub-process) | **…** | Test Plan(Sub-process) | **…**6.2 |
| **…** |  |  |  |  | **…** |
|  |  |  |  |  | 7.2 - 7.4 |
| 7.6 |  |  |  |  | 7.5 |
| 7.8 |  |  |  |  | 7.7 |

| **Dynamic Test Documentation**_(See details_ Test Specification _next page.)_Test Environment Test DataRequirement RequirementTest Environment Test DataReadiness Report Readiness ReportPerformDynamic Test Incident Test ExecutionReport Documentation 7.9 –Test Status Report | **Dynamic Test Documentation**_(See details_ Test Specification _next page.)_Test Environment Test DataRequirement RequirementTest Environment Test DataReadiness Report Readiness ReportPerformDynamic Test Incident Test ExecutionReport Documentation 7.9 –Test Status Report |
| --- | --- |

### 7.12 7.9 – 7.11

### 6.3

| **…** | Test Completion Report |  |
| --- | --- | ---: |
|  | (Sub-process) | 6.4 |
| **Test Management**  | **Test Management**  | **Test Management**  |
| **Documentation,**  | Test Completion Report |  |
| **cont.** | (Project) | 6.4 |

**Figure 1 — The hierarchy of test documentation** 

This part of ISO/IEC/IEEE 29119 is applicable to testing in all software development lifecycle models. 

© ISO/IEC 2013 – All rights reserved

**2** © IEEE 2013 – All rights reserved 

This part of ISO/IEC/IEEE 29119 is intended for, but not limited to, testers, test managers, developers, and project managers, particularly those responsible for governing, managing, and implementing software testing. 

The documents described in this part of ISO/IEC/IEEE 29119 may be issued in several versions over time. However, the handling of multiple versions of documents is out of scope of this part of ISO/IEC/IEEE 29119, because this is a configuration management issue. 

# 2 Conformance 

## 2.1 Intended usage 

The requirements in this part of ISO/IEC/IEEE 29119 are contained in [Clauses 5,](#5-organizational-test-process-documentation) [6 ](#5355-test-design-techniques)and [7. ](#6448-reusable-test-assets)This part of ISO/IEC/IEEE 29119 provides requirements for a number of test documents suitable for use during the complete software lifecycle. It is recognized that particular projects or organizations may not need to use all of the documents defined by this part of ISO/IEC/IEEE 29119. Therefore, implementation of this part of ISO/IEC/IEEE 29119 typically involves selecting a set of documents suitable for the organization or project. There are two ways that an organization can claim to conform to the provisions of this part of ISO/IEC/IEEE 29119; full or tailored conformance. Conformance may be claimed for organizations, projects, multi-supplier projects and services, as identified in the claim of conformance. 

The information items identified in[ Clauses 5,](#5-organizational-test-process-documentation)[ 6, ](#5355-test-design-techniques)and[ 7 ](#6448-reusable-test-assets)[of this pa](#annex-b-informative)rt of ISO/IEC/IEEE 29119 correspond to the outputs of the ISO/IEC/IEEE 29119-2 Test Processes.[ Annex B i](#annex-b-informative)s normative and provides an overview of the normative requiremen[ts ](#5355-test-design-techniques)for the clauses in ISO/IEC/IEEE 29119-2 where the creation of the information items defined in [Clauses 5, ](#5-organizational-test-process-documentation)[6, ](#5355-test-design-techniques)and[ 7 o](#6448-reusable-test-assets)f this part of ISO/IEC/IEEE 29119 is described. 

In this part of ISO/IEC/IEEE 29119, for simplicity of reference, each document is described as if it were published as a separate hardcopy document. Document titles and contents provided in this part of ISO/IEC/IEEE 29119 may be [mo](#5355-test-design-techniques)dified (added to, combined or re-titled) and use of the nomenclature of the specific records in[ Clauses 5,](#5-organizational-test-process-documentation)[ 6 ](#5355-test-design-techniques)and[ 7 i](#6448-reusable-test-assets)s not required to claim conformance. Documents shall be considered as conforming if they are unpublished but available in electronic form, divided into separate documents or volumes, or combined with other documents into one document. 

## 2.2 Types of conformance 

The following types of conformance shall be asserted. The selected type shall be identified in the claim of conformance documentation. 

### 2.2.1 Full Conformance 

The minimum set of required information items is all of those information items specified in [Clauses 5, ](#5-organizational-test-process-documentation)[6 a](#5355-test-design-techniques)nd[ 7 ](#6448-reusable-test-assets)of this part of ISO/IEC/IEEE 29119. 

NOTE Full conformance could be claimed for selected documents even if full conformance with the entire standard is not claimed. 

### 2.2.2 Tailored Conformance 

The content of the test documents defined in[ Clauses 5,](#5-organizational-test-process-documentation)[ 6 a](#5355-test-design-techniques)nd[ 7 ](#6448-reusable-test-assets)of this part of ISO/IEC/IEEE 29119 may be tailored based on the tailored conformance to ISO/IEC/IEEE 29119-2 Test Processes and/or based on the specific needs of an organization or project. Where tailoring occurs, justification shall be provided whenever an information item defined in[ Clauses 5,](#5-organizational-test-process-documentation)[ 6 ](#5355-test-design-techniques)and[ 7 ](#6448-reusable-test-assets)of this part of ISO/IEC/IEEE 29119 is not prepared. All tailoring decisions shall be recorded with their rationale, including the consideration of any applicable risks. Tailoring decisions shall be agreed by the relevant stakeholders. 

Tailored conformance can be achieved by: 

1. The minimum set of required test documentation is determined by the tailoring of the processes and activities in accordance with Clause 2 of ISO/IEC/IEEE 29119-2 Test Processes; and/or 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **3**

1. The minimum set of required test documentation is determined according to specific organization and/or project needs; and/or 

<div></div>

1. The minimum set of required information items within documents is determined according to specific organization and/or project needs. 

NOTE 1 In projects, particularly those following an agile approach, tailoring can be applied to all Part 3 documents to allow them to be condensed or presented in an alternate format (e.g. verbal or slide presentation). 

NOTE 2 Different document names could be used, but when this is done and conformity needs to be demonstrated, a mapping is often produced between this part of ISO/IEC/IEEE 29119 and local usage to aid conformity assessment. 

# 3 Normative references 

The following documents, in whole or in part, are normatively referenced in this document and are indispensable for its application. For dated references, only the edition cited applies. For undated references, the latest edition of the referenced document (including any amendments) applies. 

ISO/IEC/IEEE 15289:2011, _Systems and software engineering — Content of life-cycle information products (documentation)_ 

ISO/IEC/IEEE 29119-1, _Software and systems engineering — Software testing — Part 1: Concepts and definitions_ 

ISO/IEC/IEEE 29119-2, _Software and systems engineering — Software testing — Part 2: Test processes_ 

Other standards useful for the implementation and interpretation of this standard are listed in the Bibliography. 

# 4 Terms and definitions 

For the purposes of this document, the terms and definitions given in ISO/IEC/IEEE 24765 and the following apply. 

NOTE Use of the terminology in this part of ISO/IEC/IEEE 29119 is for ease of reference and is not mandatory for conformance with this part of ISO/IEC/IEEE 29119. The following terms and definitions are provided to assist with the understanding and readability of this part of ISO/IEC/IEEE 29119. Only terms critical to the understanding of this part of ISO/IEC/IEEE 29119 are included. This clause is not intended to provide a complete list of testing terms. The Systems and Software Engineering vocabulary ISO/IEC/IEEE 24765 can be referenced for terms not defined in this clause. All terms defined in this clause are also intentionally included in ISO/IEC/IEEE 29119-1, as that international standard includes all terms that are used in ISO/IEC/IEEE 29119-1, 2, 3 and 4. 

**4.1 actual results** 

set of behaviours or conditions of a test item, or set of conditions of associated data or the test environment, observed as a result of test execution 

EXAMPLE Output to screen, outputs to hardware, changes to data, reports, and communication messages sent. 

**4.2 coverage item** 

see test coverage item (4.15) 

**4.3 expected results** 

observable predicted behaviour of the test item under specified conditions based on its specification or another source 

© ISO/IEC 2013 – All rights reserved

**4** © IEEE 2013 – All rights reserved 

**4.4 feature set** 

logical subset of the test item(s) that could be treated independently of other feature sets in the subsequent test design activities 

Note 1 to entry: This could be the set of all features for the item (its full feature set), or a subset identified for a specific purpose (the functional feature set, etc.). 

**4.5 Incident Report** 

documentation of the occurrence, nature, and status of an incident 

Note 1 to entry: Incident reports are also known as anomaly reports, bug reports, defect reports, error reports, issues, problem reports and trouble reports, amongst other terms. 

**4.6 Organizational Test Specification** 

document that provides information about testing for an organization, i.e. information that is not project specific 

EXAMPLE The most common examples of organizational test specifications are the Organizational Test Policy and Organizational Test Strategy. 

**4.7 Organizational Test Strategy** 

document that expresses the generic requirements for the testing to be performed on all the projects run within an organization, providing detail on how the testing is to be performed 

Note 1 to entry: The Organizational Test Strategy is aligned with the Organizational Test Policy. 

Note 2 to entry: An organization could have more than one Organizational Test Strategy to cover markedly different project contexts. 

Note 3 to entry: The Organizational Test Strategy could incorporate the context of the Test Policy where no separate Test Policy is available 

**4.8 product risk** 

risk that a product could be defective in some specific aspect of its function, quality, or structure 

**4.9 project risk** 

risk related to the management of a project 

EXAMPLE Lack of staffing, strict deadlines, changing requirements. 

**4.10 regression testing** 

testing following modifications to a test item or to its operational environment, to identify whether regression failures occur 

Note 1 to entry: The sufficiency of a set of regression test cases depends on the item under test and on the modifications to that item or its operational environment. 

**4.11 retesting** 

re-execution of test cases that previously returned a "fail" result, to evaluate the effectiveness of intervening corrective actions 

Note 1 to entry: Also known as confirmation testing. 

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 5

**4.12 test case** 

set of test case preconditions, inputs (including actions, where applicable), and expected results, developed to drive the execution of a test item to meet test objectives, including correct implementation, error identification, checking quality, and other valued information 

Note 1 to entry: A test case is the lowest level of test input (i.e. test cases are not made up of test cases) for the test sub- process for which it is intended. 

Note 2 to entry: Test case preconditions include: test environment, existing data (e.g. databases), software under test, hardware, etc. 

Note 3 to entry: Inputs are the data information used to drive test execution. 

Note 4 to entry: Expected results include success criteria, failures to check for, etc. 

**4.13 Test Case Specification** 

documentation of a set of one or more test cases 

**4.14 Test Completion Report** 

report that provides a summary of the testing that was performed 

Note 1 to entry: Also known as a Test Summary Report. 

**4.15 test coverage item** 

attribute or combination of attributes that is derived from one or more test conditions by using a test design technique that enables the measurement of the thoroughness of the test execution 

**4.16 test data** 

data created or selected to satisfy the input requirements for executing one or more test cases, which could be defined in the Test Plan, test case or test procedure 

Note 1 to entry: Test data could be stored within the product under test (e.g., in arrays, flat files, or a database), or could be available from or supplied by external sources, such as other systems, other system components, hardware devices, or human operators. 

**4.17 Test Data Readiness Report** 

document describing the status of each test data requirement 

**4.18 Test Design Specification** 

document specifying the features to be tested and their corresponding test conditions 

**4.19 test design technique** 

activities, concepts, processes, and patterns used to construct a test model that is used to identify test conditions for a test item, derive corresponding test coverage items, and subsequently derive or select test cases 

**4.20 test environment** 

facilities, hardware, software, firmware, procedures, and documentation intended for or used to perform testing of software 

© ISO/IEC 2013 – All rights reserved

**6** © IEEE 2013 – All rights reserved 

Note 1 to entry: A test environment could contain multiple environments to accommodate specific test sub-processes (e.g. a unit test environment, a performance test environment, etc.). 

**4.21 test environment readiness report** 

document that describes the fulfillment of each test environment requirement 

**4.22 Test Environment Requirements** 

description of the necessary properties of the test environment 

Note 1 to entry: All or parts of the test environment requirements could reference where the information can be found, e.g. in the appropriate Organizational Test Strategy, Test Plan, and/or Test Specification. 

**4.23 Test Execution Log** 

document that records details of the execution of one or more test procedures 

**4.24 test item** 

work product that is an object of testing 

EXAMPLE A system, a software item, a requirements document, a design specification, a user guide. 

**4.25 Test Plan** 

detailed description of test objectives to be achieved and the means and schedule for achieving them, organized to coordinate testing activities for some test item or set of test items 

Note 1 to entry: A project could have more than one Test Plan, for example there could be a Project Test Plan (also known as a Master Test Plan) that encompasses all testing activities on the project; further detail of particular test activities could be defined in one or more test sub-process plans (e.g. a system test plan or a performance test plan). 

Note 2 to entry: Typically a Test Plan is a written document, though other formats could be possible as defined locally within an organization or project. 

Note 3 to entry: Test Plans could also be written for non-project activities, for example a Maintenance Test Plan. 

**4.26 Test Policy** 

an executive-level document that describes the purpose, goals, principles and scope of testing within an organization 

Note 1 to entry: The Test Policy defines what testing is performed and what it is expected to achieve but does not detail how testing is to be performed. 

Note 2 to entry: The Test Policy can provide a framework for establishing, reviewing and continually improving the organisations testing. 

**4.27 Test Procedure Specification** 

document specifying one or more test procedures, which are collections of test cases to be executed for a particular objective 

Note 1 to entry: The test cases in a test set are listed in their required order in the test procedure. 

Note 2 to entry: Also known as a manual test script. A test procedure specification for an automated test run is usually called a test script. 

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 7

**4.28 test result** 

indication of whether or not a specific test case has passed or failed, i.e. if the actual results correspond to the expected results or if deviations were observed 

**4.29 test set** 

collection of test cases for the purpose of testing a specific test objective 

Note 1 to entry: The test sets will typically reflect the feature sets, but they could contain test cases for a number of feature sets. 

Note 2 to entry: Test cases for a test set could be selected based on the identified risks, test basis, retesting and/or regression testing. 

**4.30 test specification** 

complete documentation of the test design, test cases and test procedures for a specific test item 

Note 1 to entry: A Test Specification could be detailed in one document, in a set of documents, or in other ways, for example in a mixture of documents and database entries. 

**4.31 test status report** 

report that provides information about the status of the testing that is being performed in a specified reporting period 

**4.32 test strategy** 

part of the Test Plan that describes the approach to testing for a specific test project or test sub-process or sub-processes 

Note 1 to entry: The test strategy is a distinct entity from the Organizational Test Strategy. 

Note 2 to entry: The test strategy usually describes some or all of the following: the test practices used; the test sub- processes to be implemented; the retesting and regression testing to be employed; the test design techniques and corresponding test completion criteria to be used; test data; test environment and testing tool requirements; and expectations for test deliverables. 

**4.33 test traceability matrix** 

document, spreadsheet, or other automated tool used to identify related items in documentation and software, such as requirements with associated tests 

Note 1 to entry: Also known as: verification cross reference matrix, requirements test matrix, requirements verification table, and others. 

Note 2 to entry: Different test traceability matrices could have different information, formats, and levels of detail. 

**4.34 testing** 

set of activities conducted to facilitate discovery and/or evaluation of properties of one or more test items 

Note 1 to entry: Testing activities include planning, preparation, execution, reporting, and management activities, insofar as they are directed towards testing. 

© ISO/IEC 2013 – All rights reserved

### 8 © IEEE 2013 – All rights reserved 

# 5 Organizational Test Process Documentation 

## 5.1 Overview 

Organizational test specifications describe information about testing at the organization level, and are not project-dependent. Typical examples of organizational test specifications developed in the organizational test process include: 

 Test Policy; 

 Organizational Test Strategy. 

## The full templates with explanatory text for the document follow in sub-clauses [5.2 Test Policy ](#5-organizational-test-process-documentation)and[ 5.3 ](#5246-standards)Organizational Test Strategy. Annex A provides an abbreviated overview of each document.[ Annexes D ](#annex-d-informative)and[ E ](#annex-e-informative)provide examples of a Test Policy and Organizational Test Strategy for example projects. 

**5.2 Test Policy** 

### 5.2.1 Overview 

The Test Policy defines the objectives and principles of software testing to be applied within the organization. It defines what should be accomplished by testing, but does not detail how testing is performed. The policy provides a framework for establishing, reviewing, and continually improving the organization’s Test Policy. 

Annex A.2.2 provides an outline of the Organizational Test Policy, while annexes [D.1 ](#annex-d-informative)and [D.2 ](#annex-d-informative)provide examples that demonstrate how Organizational Test Policies could be developed for two different example projects. 

The contents of the Test Policy include: 

### 5.2.2 Document specific information 

#### 5.2.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place, if the contents are kept in electronic form, e.g. in a database. 

#### 5.2.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 5.2.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 5.2.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 5.2.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **9**

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 5.2.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 5.2.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 5.2.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

EXAMPLE Referenced documents could be policies, plans, procedures, and other source data. 

#### 5.2.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 5.2.4 Test policy statements 

#### 5.2.4.1 Objectives of testing 

Describes the purpose, goals, and overall scope of the testing within the organization. States the organization’s position on why testing is performed and what they look to achieve. 

#### 5.2.4.2 Test process 

Identifies the test process that the organization will follow. This may include reference to a specific document providing details of the test process. 

EXAMPLE Such a document could be ISO/IEC/IEEE 29119-2 Test Processes. The details of activities in the test process could be described in more detailed test process documentation. 

#### 5.2.4.3 Test organization structure 

Identifies the roles and structure of the test organization. A diagram to show test organization hierarchy may be used, or the information may be presented in a table. 

#### 5.2.4.4 Tester training 

States required training and certifications for individuals working in the test organization. 

#### 5.2.4.5 Tester ethics 

Identifies the organizational ethics code to be upheld by the testers. 

© ISO/IEC 2013 – All rights reserved

**10** © IEEE 2013 – All rights reserved 

#### 5.2.4.6 Standards 

States which standards are applicable within the test organization. 

#### 5.2.4.7 Other relevant policies 

Identifies policies that impact the test organization. 

EXAMPLE A policy statement could be that testing will conform to the Quality Policy. 

#### 5.2.4.8 Measuring the value of testing 

States how the organization determines the return on investment of testing. Identifies the objectives for measuring the value of testing. 

#### 5.2.4.9 Test asset archiving and reuse 

States the organization’s position on the archiving and reuse of test assets. 

#### 5.2.4.10 Test process improvement 

States the method for ensuring continuous improvement of the test process. 

## 5.3 Organizational Test Strategy 

### 5.3.1 Overview 

The Organizational Test Strategy is a technical document that provides guidelines on how testing should be carried out within the organization, i.e. how to achieve the objectives stated in the Test Policy. 

The Organizational Test Strategy is a generic document at an organizational level that provides guidelines to projects within its scope; it is not project-specific. 

For small or highly homogenous organizations a single Organizational Test Strategy may cover all testing activities. An organization may have more than one Organizational Test Strategy if the organization performs development in a number of significantly different ways, such as both safety-critical products and non-critical products; or if it is using both agile and V-model development models; or if its programmes are large enough to merit their own strategy. 

The Organizational Test Strategy may incorporate the content of the Test Policy where no separate Test Policy is available. 

An Organizational Test Strategy includes identification of relevant test sub-processes and strategy statements for each of these. The document may be partitioned with a sub-section for each of the identified test sub- process if the test sub-processes strategy statements differ significantly between the test sub-processes; this is illustrated in the figure below. 

Annex A.2.3 provides an outline of the Organizational Test Strategy, while annexes [E.1 ](#annex-e-informative)and [E.2 ](#e2-example-2--traditional-ltd)provide examples that demonstrate how Organizational Test Strategies could be developed for two different example projects. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **11**

![](data:image/jpeg;base64,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)

**Figure 2 — An example structure of the Organizational Test Strategy** 

The contents of the Organizational Test Strategy include: 

### 5.3.2 Document specific information 

#### 5.3.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place, if the contents are kept in electronic form, e.g. in a database. 

#### 5.3.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 5.3.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 5.3.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

© ISO/IEC 2013 – All rights reserved

**12** © IEEE 2013 – All rights reserved 

#### 5.3.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 5.3.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 5.3.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 5.3.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

EXAMPLE Documents could be policies, plans, procedures, and other source data. 

#### 5.3.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 5.3.4 Project-wide organizational test strategy statements 

The strategy is defined for the specified scope. This section includes statements that are appropriate for all test sub-processes to be performed in a given project within the scope of the strategy. This section may include subsections from the policy, if needed. 

#### 5.3.4.1 Generic risk management 

Identifies the generic approach to risk management expected to be used to direct the testing activities. 

#### 5.3.4.2 Test selection and prioritization 

Describes the organization’s approach to selecting and prioritizing test execution, in the form of prioritized test procedures. Test procedures consist of prioritized test cases, derived from prioritized feature sets via prioritized test conditions and coverage items. 

#### 5.3.4.3 Test documentation and reporting 

Identifies the documents expected to be produced during testing for the test project as a whole. Describes when each is prepared and the associated approval process. This is tightly connected to the test process that is specified in the policy. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **13**

#### 5.3.4.4 Test automation and tools 

Describes the approach to test automation within the organization. Identifies the testing tools to be used throughout testing. 

EXAMPLE This could include test management tools, test execution tools, performance testing tools, security testing tools, usability testing tools. 

#### 5.3.4.5 Configuration management of test work products 

Describes the configuration management to be performed for the work products from testing; describes how these work products are to be identified, traced, stored, and made available to stakeholders. 

#### 5.3.4.6 Incident management 

Describes how incidents should be managed during testing or refers to a description elsewhere. 

#### 5.3.4.7 Test sub-processes 

Identifies specific test sub-processes to be performed as part of the testing within the scope of the strategy. 

### 5.3.5 Test sub-process-specific organizational test strategy statements 

#### 5.3.5.1 Entry and exit criteria 

Specifies the criteria used to determine when the test activities for the defined test sub-process should start and stop. 

A test sub-process consists of the following processes: 

 Test design & implementation; 

 Test environment set-up & maintenance; 

 Test execution; and 

 Test incident reporting. 

Different entry and exit criteria may be defined for each of these individually, or for selected ones, or for the entire sub-process as a whole. 

| **5.3.5.2**  | **Test completion criteria**  |
| ---: | --- |
| Describes how the organization considers the testing activities for the test sub-process to be complete.  |  |
| **5.3.5.3**  | **Test documentation and reporting**  |

Identifies the test documentation, including reporting, used for testing activities in the test sub-process. Describes when each document or report is prepared and the associated approval process. This is tightly connected to the test process specified in the policy. 

#### 5.3.5.4 Degree of independence 

Establishes the level of independence of those performing the testing. States how this testing group is technically, managerially, and financially independent. 

© ISO/IEC 2013 – All rights reserved

**14** © IEEE 2013 – All rights reserved 

#### 5.3.5.5 Test design techniques 

Identifies specific test design techniques to be used during test design and implementation within the test sub- process. 

#### 5.3.5.6 Test environment 

Identifies the test environment for the test sub-process; may state where specific types of test should be performed, and identifies groups or organizations responsible for the test environment. May identify the origin of test data, state where particular types of test data are located, and groups or organizations responsible for test data. 

#### 5.3.5.7 Metrics to be collected 

Describes the metrics for which values are to be collected during the test activities in the test sub-process. 

#### 5.3.5.8 Retesting and regression testing 

Identifies the strategy, conditions, and activities for retesting and regression testing in the test sub-process. 

# 6 Test Management Processes Documentation 

## 6.1 Overview 

The documents developed in the test management processes comprise the following types: 

 Test Plan; 

 Test Status Report; 

 Test Completion Report. 

The full templates with expla[natory text f](#annex-f-informative)or the documents are found below.[ Annex A p](#annex-a-informative)rovides an abbreviated overview of each document.[ Annexes F,](#annex-f-informative) [G, ](#annex-g-informative)and[ H ](#annex-h-informative)provide examples of Test Plans, Test Status Reports, and Test Completion Reports for example projects. 

## 6.2 Test Plan 

### 6.2.1 Overview 

The Test Plan provides a test planning and test management document. Some projects may have a single test plan, while for larger projects multiple test plans may be produced. Test plans may apply across multiple projects (at the programme level), or to a single project (project test plan/master test plan), or to a specific test sub-process (system test plan, integration software test plan, sub-system test plan, sub-contractor software test plan, unit software test plan, or performance test plan, or to a specific iteration of testing). If more software test plans are created, a mapping tree may be produced to aid documenting relationships and the information contained in each. 

The Test Plan describes the decisions made during the initial planning and evolves as re-planning is performed as part of the control activity. 

Annex A.2.4 provides an outline of the Test Plan, while annexes [F.1 ](#annex-f-informative)and F.2 provide examples that demonstrate how Test Plans could be developed for two different example projects. 

The contents of the Test Plan include: 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **15**

### 6.2.2 Document specific information 

#### 6.2.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 6.2.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 6.2.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 6.2.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 6.2.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 6.2.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 6.2.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 6.2.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

EXAMPLE References to test item documentation relevant to an individual test sub-process could include: 

 Requirements; 

 Design; 

 User’s guide; 

 Operations guide; and/or 

 Installation guide. 

© ISO/IEC 2013 – All rights reserved

**16** © IEEE 2013 – All rights reserved 

#### 6.2.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 6.2.4 Context of the testing 

#### 6.2.4.1 Project(s) / test sub-process(es) 

Identifies the project(s) or the test sub-process(es) for which the plan is being written and other relevant contextual information. 

#### 6.2.4.2 Test item(s) 

Identifies the test item(s) for the testing covered by this plan including their version/revision or reference where this information can be found. 

This section may describe the mission/business purpose of the test item(s), or reference where this information can be found. 

NOTE This information could be defined in a system definition document, such as a concepts of operations. 

EXAMPLE The test item could be a software unit, interfaces between units, a subsystem, or a complete system. 

It may also identify any procedures for the transfer of the test item(s) from other environments to the test environment. 

#### 6.2.4.3 Test scope 

Summarizes the features of the test item(s) to be tested. Also identifies any features of the test item(s) that are to be specifically excluded from testing and the rationale for their exclusion. 

EXAMPLE Features to be tested could be specific attributes of the software, functions, interfaces, or business processes. 

#### 6.2.4.4 Assumptions and constraints 

Describes any assumptions and constraints for the test effort covered by this plan. These may include regulatory standards, the requirements in the Test Policy and the Organizational Test Strategy, contractual requirements, project time and cost constraints, and availability of appropriately-skilled staff, tools and/or environments. 

#### 6.2.4.5 Stakeholders 

Lists the stakeholders and their relevance to the testing. Describes how the communication with each stakeholder is to be performed. 

### 6.2.5 Testing communication 

Describes the lines of communication between testing, other lifecycle activities, and within the organization. 

EXAMPLE This could include the authority for resolving issues raised as a result of the testing activities and the authority for approving test products and processes. 

This information may be represented visually. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **17**

NOTE A visual representation could include an organization chart or a figure that illustrates the flow of information and data. 

### 6.2.6 Risk register Identifies the risks considered by the testing covered by this plan. This should include any relevant risks that may be specified in the Organizational Test Strategy. Provides an exposure level for each risk based on its impact and probability. Provides recommendations to treat the risks. This section may reference where a separate risk register can be found. 

EXAMPLE Recommendations to treat risk could include eliminate, reduce, or ignore risk. NOTE A risk register could be located in a project plan or a risk management plan. 

#### 6.2.6.1 Product risks Identifies test-related product risks and provides recommendations to treat each risk. 

EXAMPLE Test-related product risks could include defects in functionality or in non-functional aspects such as performance. 

#### 6.2.6.2 Project risks Identifies test-related project risks and provides recommendations to treat each risk. 

EXAMPLE Test-related project risks could include risks related to schedule or resources. 

### 6.2.7 Test strategy Describes the approach to testing for the specified test project or test sub-process, as outlined in the following sub-clauses. The document may refer to the Organization Test Strategy stating only its differences from it. 

#### 6.2.7.1 Test sub-processes For a project test plan this identifies the sub-processes of testing that will be conducted. 

#### 6.2.7.2 Test deliverables Identifies all documents that are to be delivered from the testing activity or equivalent information to be recorded electronically, for example in databases or dedicated test tools. 

EXAMPLE The following documents could be included: Test Plan; 

 Test Design Specification; Test Case Specification; 

 Test Procedure Specification; Test Data Readiness Report; 

 Test Environment Readiness Report; Incident Reports; 

 Test Status Reports; and Test Completion Report. 

Test input data and test output data may be identified as deliverables. Test tools created as part of the testing activity may also be included. If documents have been combined or eliminated, then this list will be modified accordingly. 

© ISO/IEC 2013 – All rights reserved

**18** © IEEE 2013 – All rights reserved 

This subsection may include when the document(s) should be delivered, and to/from whom (preferably by position, not name). 

#### 6.2.7.3 Test design techniques 

Specifies which test design techniques are to be applied. 

#### 6.2.7.4 Test completion criteria 

Describes the conditions under which the relevant test organization considers test execution activities to be complete. 

EXAMPLE This could be when a specific coverage has been reached and the number of outstanding defects is 

| under a specified limit.  |  |
| ---: | --- |
| **6.2.7.5**  | **Metrics to be collected**  |
| **6.2.7.6**  | **Test data requirements**  |

Describes the metrics for which values are to be collected during the test activities. 

Specifies all relevant test data requirements for the project or test sub-process (as appropriate). 

EXAMPLE This could identify the origin of the test data and state where specific test data is located, whether data has to be disguised for confidentiality reasons, and/or the role responsible for the test data. 

These test data requirements may be deferred to the Test Data Requirements document (see 7.5), as applicable. 

#### 6.2.7.7 Test environment requirements 

Specifies the necessary and desired properties of the test environment. 

EXAMPLE This could include hardware, software, testing tools, databases, and personnel (identifying their organizations, as appropriate). 

Includes information regarding selection, evaluation, acquisition and support for each tool. It may include test environment requirements for test preparation, test execution (including data capture), and any post-execution activities. 

EXAMPLE A post-execution activity could be data analysis. 

These test environment requirements may be deferred to the Test Environment Requirements document (see 7.6), as applicable, but reference to this separate document should be stated in the Test Plan. 

#### 6.2.7.8 Retesting and regression testing 

Specifies the conditions under which retesting and regression testing will be performed. This could include a description of the estimated number of test cycles. 

#### 6.2.7.9 Suspension and resumption criteria 

Specifies the criteria used to suspend and resume all or a portion of the testing activities in the Test Plan. Identifies who is responsible for suspending and resuming testing activities. Specifies the testing activities that may have to be repeated when testing is resumed. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **19**

#### 6.2.7.10 Deviations from the Organizational Test Strategy 

Records any Test Plan content that deviates from the Organizational Test Strategy. Identifies the authorities responsible for approving deviations, where applicable. 

### 6.2.8 Testing activities and estimates 

Identifies all necessary testing activities based on the test process to be used. The activity iteration strategy for the re-execution of test activities should be considered as well as any dependencies. 

NOTE The testing activities could be described in terms of a work breakdown structure or activities on an activity board in agile projects. 

EXAMPLE Activities that could be considered include those concerning retesting and regression testing. 

Describes estimates for each of the identified testing activities to be performed as part of the testing activities covered by the test plan. Additionally, where appropriate, describes the allocated testing budget and cost estimates or references where that information can be found. 

NOTE Budget and cost estimates could be located in the project plan. 

### 6.2.9 Staffing 

Describes the staffing requirements for the testing covered by this plan. 

#### 6.2.9.1 Roles, activities, and responsibilities 

Provides an overview of the primary (they are the activity leader) and secondary (they are not the leader, but providing support) people filling the test-related roles and their corresponding responsibilities and authority for the testing activities. In addition, identifies those responsible for providing the test item(s). They may be participating either full- or part-time. 

EXAMPLE The responsible parties could include the project manager, the test manager, the developers, the test analysts and executors, operations staff, user representatives, technical support staff, data administration staff, and quality support staff. 

For each testing person, specify the period(s) when the person is required. 

#### 6.2.9.2 Hiring needs 

Identifies specific requirements for additional testing staff that are necessary for the test project or test sub- process. Specifies when the staff are needed, if they should be temporary, full or part time, and the desired skill set. These may be defined by contract and business needs. 

NOTE Staffing could be accomplished by internal transfer, external hiring, consultants, subcontractors, business partners, and/or outsourced resources. 

#### 6.2.9.3 Training needs 

Specifies test training needs by skill level and identifies training options for providing the necessary skills for the staff needed. 

EXAMPLE Training can take a variety of forms, including options such as traditional classroom training, self-paced computer-based training, training over the Internet, visiting the future user site, and mentoring by more knowledgeable staff members. 

### 6.2.10 Schedule 

Identifies test milestones defined in the project schedule and from the test strategy. Summarizes the overall schedule of the testing activities, identifying where activity results feed back to the development, 

© ISO/IEC 2013 – All rights reserved

**20** © IEEE 2013 – All rights reserved 

organizational, and supporting processes. Specifies the schedule for each testing activity and test milestones based on the activity estimates, available resources, and other constraints. 

EXAMPLE Supporting processes could be quality assurance and configuration management. 

## 6.3 Test Status Report 

### 6.3.1 Overview 

The Test Status Report provides information about the status of the testing that is performed in a specific reporting period. 

NOTE In an agile project, the Test Status Report might not be a written document. For example, its contents could be discussed at iteration meetings and supplemented by information stored on activity boards and burn-down charts. 

Annex A.2.5 provides an outline of the Test Status Report, while Annexes[ G.1 ](#annex-g-informative)and [G.2 p](#annex-g-informative)rovide examples that demonstrate how Test Status Reports could be developed for two different example projects. 

The contents of the Test Status Report include: 

### 6.3.2 Document specific information 

#### 6.3.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 6.3.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 6.3.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 6.3.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 6.3.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 6.3.3 Introduction 

Provides explanatory information about the context and structure of the document. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **21**

#### 6.3.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 6.3.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 6.3.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 6.3.4 Test status 

Provides information on the status of the testing for the reporting period. 

#### 6.3.4.1 Reporting period 

Specifies the time period covered by the report. 

#### 6.3.4.2 Progress against Test Plan 

Describes the progress that has been made against the Test Plan. Any notable deviations from the plan should be highlighted, with explanations of the reasons for deviation, description of any remedial actions, an account of the effects, and consideration of the implications with regard to planned project objectives. 

#### 6.3.4.3 Factors blocking progress 

Identifies those factors that impeded progress during the reporting period and the corresponding solutions that were implemented to remove them. Outstanding (unsolved) issues still impeding progress should be recorded and possible solutions identified. 

#### 6.3.4.4 Test measures 

Presents the collated test measures related to the end of the reporting period. 

EXAMPLE This could include measures on test cases, defects, incidents, test coverage, activity progress and resource consumption. 

#### 6.3.4.5 New and changed risks 

Lists the new risks that have been identified as a result of monitoring and controlling testing as well as changes to existing risks during the reporting period. 

#### 6.3.4.6 Planned testing 

Describes the planned testing for the next reporting period. 

© ISO/IEC 2013 – All rights reserved

**22** © IEEE 2013 – All rights reserved 

## 6.4 Test Completion Report 

### 6.4.1 Overview 

The Test Completion Report provides a summary of the testing that was performed. This may be for the project/programme as a whole or for the particular test sub-process. 

Annex A.2.6 provides an outline of the Test Completion Report, while Annexes[ H.1 ](#annex-h-informative)and [H.2 p](#h2-example-2--traditional-ltd)rovide examples that demonstrate how Test Completion Reports could be developed for two different example projects. 

The contents of the Test Completion Report include: 

### 6.4.2 Document specific information 

#### 6.4.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 6.4.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 6.4.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 6.4.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 6.4.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 6.4.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 6.4.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **23**

#### 6.4.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 6.4.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 6.4.4 Testing performed 

Provides a description of the testing performed. 

#### 6.4.4.1 Summary of testing performed 

Summarizes the testing performed across the project and/or in the test sub-processes that are in scope for this report. 

Provides details on what was tested, and describes any constraints on how the testing was performed. 

EXAMPLE This could include restrictions on test environment availability. 

#### 6.4.4.2 Deviations from planned testing 

Describes deviations from the planned testing, if any. This section may also reference the section on residual risks for any risks that the deviations pose to the testing and their relevant risk treatments. 

#### 6.4.4.3 Test completion evaluation 

Describes the extent to which the testing met the specified test completion criteria, and where necessary, explains why the criteria were not met. This section may also reference the section on residual risks for any risks that any incomplete completion criteria pose to the testing and their relevant risk treatments. 

#### 6.4.4.4 Factors that blocked progress 

Identifies those factors that impeded progress and the corresponding solutions that were implemented to remove them. 

#### 6.4.4.5 Test measures 

Presents the collated test measures. 

EXAMPLE This could include measures for test cases, defects, incidents, test coverage, activity progress, and resource consumption. 

#### 6.4.4.6 Residual risks 

Lists the risks that are untreated at the end of the testing; this may be risks that have not been fully treated by the test and /or any new risks identified as a result of the final monitoring and closure of the test. 

#### 6.4.4.7 Test deliverables 

Lists all the test deliverables produced as a result of the test effort and their location. 

EXAMPLE This could include the Test Plan, Test Case Specifications and Test Procedure Specifications. 

© ISO/IEC 2013 – All rights reserved

**24** © IEEE 2013 – All rights reserved 

#### 6.4.4.8 Reusable test assets 

Lists all the reusable test assets and their location. 

EXAMPLE This could include test procedures and test data that were produced as a result of the test effort. 

#### 6.4.4.9 Lessons learned 

Describes the results of the lessons learned meeting. 

# 7 Dynamic Test Processes Documentation 

## 7.1 Overview 

The documents developed in the dynamic test processes comprise the following types: 

 Test Specification, divided into: 

 Test Design Specification; 

 Test Case Specification; 

 Test Procedure Specification. 

NOTE These could be separate documents, could appear as chapters in a test specification document, or could be in the form of charters depending on the size and nature of the test project. 

 Test Data Requirements; 

 Test Environment Requirements; 

 Test Data Readiness Report; 

 Test Environment Readiness Report; 

 Test Execution Documentation, divided into: 

 Actual Results; 

 Test Results; 

 Test Execution Log. 

 Incident Report. 

The full templates with explanatory text for the documents are found below.[ Annex A p](#annex-a-informative)rovides an abbreviated overview of each document. Annexes I to S provide examples of the dynamic test process documentation for example organizations. 

NOTE There are many documentation styles and names, e.g. in agile, session sheets and charters with test ideas. It is expected that in the tailoring defined in clause 2.2, other names might be substituted for the names in this part. A mapping could be produced. In the annexes to this standard, examples for two different project types are presented with options for tailoring of names. The annexes are not inclusive of all document names, formats, and test methodologies, but intended to show some possible options. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **25**

## 7.2 Test Design Specification 

### 7.2.1 Overview 

The Test Design Specification identifies the features to be tested, and the test conditions derived from the test basis for each of the features as the first step towards the definition of test cases and test procedures to be executed. 

Annex A.2.7 provides an outline of the Test Design Specification, while Annexes[ I.1 a](#annex-i-informative)nd[ I.2 p](#annex-i-informative)rovide examples that demonstrate how Test Design Specifications could be developed for two different example projects. 

The contents of the Test Design Specification include: 

### 7.2.2 Document specific information 

#### 7.2.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.2.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.2.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.2.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.2.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.2.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.2.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

© ISO/IEC 2013 – All rights reserved

**26** © IEEE 2013 – All rights reserved 

#### 7.2.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.2.3.3 Notation convention(s) 

Defines and explains any identification or numbering schemes needed for test sets and test conditions, if this is not defined elsewhere. 

NOTE This could be found in a Configuration Management Plan. 

#### 7.2.3.4 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.2.4 Feature sets 

#### 7.2.4.1 Overview 

A feature set is a logical grouping of the features to be tested for the test item(s), which are specified in the Test Plan. The features to be tested may be described by a single feature set or a number of feature sets, possibly arranged in a hierarchy. The feature sets may correspond directly to the architecture of the test item(s), or may be different if this facilitates a more efficient test. A feature set may also be a business process that consists of a series of features. Each feature set may be treated independently of other feature sets in the subsequent test design activities. 

The feature sets may be described in lists or in tables in a document or using a tool. 

EXAMPLE Feature sets could be stored in a database or a dedicated test tool. 

The information for a feature set includes: 

#### 7.2.4.2 Unique identifier 

Describes the unique identifier for the feature set so that it can be distinguished from all other feature sets. An automated tool may control the generation of the identifiers, or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the feature set, because it is used for traceability purposes. 

#### 7.2.4.3 Objective 

Identifies and briefly describes the special focus or objective for the feature set. 

#### 7.2.4.4 Priority 

Defines the priority for the testing of this particular feature set, if needed. 

#### 7.2.4.5 Specific strategy 

Specifies the implementation of the strategy for testing the feature set. 

EXAMPLE This could include the use of specific test design techniques, defined in the corresponding Test Plan, if needed. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **27**

#### 7.2.4.6 Traceability 

Lists reference(s) to the associated features in the test basis. 

NOTE The traceability could be documented in a Test Traceability Matrix or a tool. 

EXAMPLE Features could be requirement(s) and/or design description(s). 

### 7.2.5 Test conditions 

#### 7.2.5.1 Overview 

Summarizes the test conditions for a feature set. A test condition is an individual item or event specified in the test basis that could be verified by one or more test cases. 

NOTE A test condition could simply be a reference to a requirement (if the requirement is expressed in a verifiable way, i.e. if it includes an identifiable acceptance criterion), or to a design description. A test condition could also be a rewording of a requirement, a set of requirements, or a design description created for the purpose of testing, e.g. summarising a number of requirements in a decision table model or as a state model. 

This section in the Test Design Specification could be formatted to list test conditions under corresponding feature sets. 

NOTE The test conditions could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. Test conditions are not always formally documented, as they could be seen as a first draft of test coverage items and/or test cases. 

 The information for a test condition includes: 

#### 7.2.5.2 Unique identifier 

Describes the unique identifier for the test condition so that it can be distinguished from all other test conditions. An automated tool may control the generation of the identifiers, or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test condition, because it is used for traceability purposes. 

When the number or volatility of test conditions is so high that these requirements for unique identifiers become impractical, they may be replaced by the use of other means, generally based on automated tools, to establish traceability between test cases and test conditions. 

#### 7.2.5.3 Description 

Describes the test condition, i.e. what can be tested. This may be written in natural language, and/or expressed as tabular or graphical models, as appropriate. It may simply reference the requirement that serves as the test condition. 

#### 7.2.5.4 Priority 

Defines the priority for the testing of this particular test condition within the feature set. The higher priory test conditions will be tested earlier and more extensively than the lower priority test conditions. 

#### 7.2.5.5 Traceability 

Describes traceability to the feature set or lists reference(s) to the associated requirement(s) and/or design description(s) in the test basis. This could be documented in a Test Traceability Matrix. 

© ISO/IEC 2013 – All rights reserved

**28** © IEEE 2013 – All rights reserved 

## 7.3 Test Case Specification 

### 7.3.1 Overview 

The Test Case Specification identifies the test coverage items and the corresponding test cases derived from the test basis for one or more feature sets. 

Annex A.2.8 provides an outline of the Test Case Specification, while Annexes [J.1 ](#annex-j-informative)and[ J.2 ](#annex-j-informative)provide examples that demonstrate how Test Case Specification could be developed for two different example projects. 

The contents of the Test Case Specification include: 

### 7.3.2 Document specific information 

#### 7.3.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.3.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.3.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.3.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.3.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change may be document author, project manager, system owner. 

### 7.3.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.3.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **29**

#### 7.3.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.3.3.3 Notation convention(s) 

Defines and explains any identification or numbering schemes needed for test coverage items and test cases, if this is not defined elsewhere. 

NOTE This could be found in a Configuration Management Plan. 

#### 7.3.3.4 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.3.4 Test coverage items 

#### 7.3.4.1 Overview 

Summarizes the test coverage items for the test conditions. Test coverage items are derived by applying a test design technique to the test condition. 

EXAMPLE Equivalence partitioning will identify test coverage items in terms of valid and invalid equivalence partitions. 

This section in the Test Case Specification could be formatted to list test coverage items under corresponding feature sets and/or test conditions. 

NOTE The test coverage items could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. Test coverage items are not always formally documented, as they could be seen as a draft of test cases. 

The information for a test coverage item includes: 

#### 7.3.4.2 Unique identifier 

Describes the unique identifier for the test coverage item so that it can be distinguished from all other test coverage items. An automated tool may control the generation of the identifiers, or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test coverage item, because it is used for traceability purposes. 

When the number or volatility of test conditions is so high that these requirements for unique identifiers become impractical, they may be replaced by the use of other means, generally based on automated tools, to establish traceability between test cases and test conditions. 

#### 7.3.4.3 Description 

Describes the test coverage item, i.e. what is expected to be covered by a test case according to the test design technique that was used during its derivation. It may also include additional information about the coverage item. 

| EXAMPLE  | Whether or not it is a valid or invalid equivalence partition.  |  |
| ---: | --- | --- |
|  |  | © ISO/IEC 2013 – All rights reserved |
| **30** |  | © IEEE 2013 – All rights reserved |

#### 7.3.4.4 Priority 

Defines the priority for the testing of this particular test coverage item within the test condition, if needed. The higher priority test coverage items will be run before the lower priority test coverage items. 

#### 7.3.4.5 Traceability 

Describes traceability to the test condition or feature set that the test coverage item belongs to or lists reference(s) to the associated test basis. This may be documented in a Test Traceability Matrix. 

EXAMPLE Test basis could be requirements or design. 

### 7.3.5 Test cases 

#### 7.3.5.1 Overview 

Defines the test cases derived from the test coverage items. A test case specifies how one or more test coverage item(s) are exercised to help determine whether or not that part of the test item has been implemented correctly. 

The number of test cases derived from test coverage items will depend on the test coverage criterion defined in the Test Plan. 

This section in the Test Case Specification could be formatted to list test cases under corresponding feature sets and/or test conditions. 

NOTE The test cases could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. 

 The information for a test case includes: 

#### 7.3.5.2 Unique identifier 

Describes the unique identifier for the test case so that it can be distinguished from all other test cases. An automated tool may control the generation of the identifiers or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test case item, because it is used for traceability purposes. 

#### 7.3.5.3 Objective 

Identifies and briefly describes the special focus or objective of the test case. This is typically in the form of a title. 

#### 7.3.5.4 Priority 

Defines the priority for the testing of this particular test case, if needed. The higher priority test cases will be run before the lower priority test cases. 

#### 7.3.5.5 Traceability 

Describes traceability to the test coverage item that the test case exercises or lists reference(s) to the associated requirement(s) and/or design description(s) in the test basis. This may be documented in a Test Traceability Matrix. 

#### 7.3.5.6 Preconditions 

Describes the required state of the test environment and any special constraints pertaining to the execution of the test case. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **31**

EXAMPLE The state the test item must be in before execution could start, including existence of specific test data and the currently active form or screen. 

This could be described explicitly or it could include references to other test cases, whose execution will set the preconditions. 

The environment needed may be described collectively for one or more feature sets, or it may not be described in this specification if the description in the Test Plan is sufficient. 

#### 7.3.5.7 Inputs 

Specifies each action required to bring the test item into a state where the expected result can be compared to the actual results. The detail of the descriptions should be tailored to fit the knowledge of the test executors. 

NOTE This could require provision of input data and/or events, e.g. button clicks, to the test item. Some of the input data may be specified by value, while others may be specified by name. Constant tables, transaction files, databases, files, terminal messages, memory resident areas, and values passed by the operating system must be considered. 

All required relationships between input events must be described. 

EXAMPLE A relationship could be timing. 

The actions may be numbered within the test case, if needed. 

#### 7.3.5.8 Expected results 

Specifies the expected outputs and behaviour required of the test item in response to the inputs that are given to the test item when it is in its precondition state. Provides the expected value(s) (with tolerances where appropriate) for each required output. 

EXAMPLE Behaviour required of the test item could be response time. 

The actions required to compare the expected results to the actual results may also be specified. For instance, examining the output in a field on a form that is not active when the input is provided, waiting for a batch job to run and a report to be printed out and examined, or closing down the test item and restarting it to examine stored data. 

#### 7.3.5.9 Actual results and test result 

The description of a test case may include placeholders to record actual results and/or test result during execut[ion o](#7357-inputs)f the test case. Alternatively, these may be recorded in the Test Procedure Sp[ecifica](#784-test-environment-readiness)tion (see clause[ 7.4)](#7357-inputs), or separately in the Actual Results (see clause 7.9) and/or Test Result (see clause[ 7.10)](#784-test-environment-readiness). 

## 7.4 Test Procedure Specification 

### 7.4.1 Overview 

The Test Procedure Specification describes the test cases in the selected test sets in execution order, along with any associated actions that may be required to set up the initial preconditions and any post execution wrap up activities. 

NOTE The test procedures could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. 

Annex A.2.9 provides an outline of the Test Procedure Specification, while Annexes[ K.1 ](#annex-k-informative)and [K.2 ](#annex-k-informative)provide examples that demonstrate how Test Procedure Specifications could be developed for two different example projects. 

The contents of the Test Procedure Specification include: 

© ISO/IEC 2013 – All rights reserved

**32** © IEEE 2013 – All rights reserved 

### 7.4.2 Document specific information 

#### 7.4.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.4.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.4.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.4.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.4.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.4.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.4.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.4.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.4.3.3 Notation convention(s) 

Defines and explains any identification or numbering schemes needed for test sets and test procedures, if this is not defined elsewhere. 

NOTE This could be found in a configuration management plan. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **33**

#### 7.4.3.4 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.4.4 Test sets 

#### 7.4.4.1 Overview 

Describes the assembly of test cases into test sets for the purpose of testing a specific test objective. The test sets will typically reflect the feature sets, but they may contain test cases for a number of feature sets. Test cases for a test set may be selected based on the identified risks, test basis, retesting and/or regression testing. 

NOTE The test sets could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. Test sets are not always formally documented, as they could be seen as a drafting step for the creation of test procedures. 

The information for a test set includes: 

#### 7.4.4.2 Unique identifier 

Describes the unique identifier for the test set so that it can be distinguished from all other test sets. An automated tool may control the generation of the identifiers or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test set, because it is used for traceability purposes. 

#### 7.4.4.3 Objective 

Identifies and briefly describes the special focus or objective for the test set. 

EXAMPLE “This test set is targeted at retesting corrections regarding incidents IN301 and IN56”. 

#### 7.4.4.4 Priority 

Defines the priority for the testing of this particular test set, if needed. 

#### 7.4.4.5 Contents (Traceability) 

Summarizes the contents of the test set. This will usually be a list of the unique identifiers of the selected test cases. 

### 7.4.5 Test procedures 

#### 7.4.5.1 Overview 

Describes the test procedures that have been derived for the test sets. A test procedure specifies the order in which the test cases in the corresponding test set should be executed according to dependencies described by pre-conditions and post-conditions and other testing requirements. 

NOTE The test procedures could be described in lists or in tables in a document or using a tool, e.g. a database or a dedicated test tool. 

The information for a test procedure includes: 

© ISO/IEC 2013 – All rights reserved

**34** © IEEE 2013 – All rights reserved 

#### 7.4.5.2 Unique identifier 

Describes the unique identifier for the test procedure so that it can be distinguished from all other test procedures. An automated tool may control the generation of the identifiers or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test procedure, because it is used for traceability purposes. 

#### 7.4.5.3 Objective 

Identifies and briefly describes the special focus or objective of the test procedure. This will be identical to the objective of the corresponding test set. 

#### 7.4.5.4 Priority 

Defines the priority for this particular test procedure, if needed. This will be identical to the priority of the corresponding test set. 

#### 7.4.5.5 Start up 

Describes the necessary actions to prepare for execution of the test cases specified in the test procedure. This will typically be the actions to set up the preconditions for the first test case to be executed. 

#### 7.4.5.6 Test cases to be executed (Traceability) 

Lists the test cases in the order in which they are to be executed. The test cases may be numbered sequentially within the test procedure. The degree to which the procedure can be varied may be defined. 

This list may be a reference to the test cases, or it may be a copied list of the test cases. 

If the execution of one or more test cases in the procedure does not set the preconditions for the following test case, actions to set the preconditions may be added between test cases. 

The test procedure may include placeholders to record actual results and/or test results. Alternatively, actual results and/or test res[ults m](#784-test-environment-readiness)ay be recorded in the Actual Results document (see [7.9) ](#784-test-environment-readiness)and/or Test Result document (see clause [7.10)](#784-test-environment-readiness). 

#### 7.4.5.7 Relationship to other procedures 

Describes dependencies this test procedure may have on any other test procedures. 

Examples of dependencies on other test procedures include that they are executed before this one, concurrently with this one, or subsequent to this one. 

#### 7.4.5.8 Stop and wrap up 

Describes the actions necessary to bring execution to an orderly halt and the actions necessary after the execution of the procedure has been completed. 

EXAMPLE Actions could be termination of logging or resetting of test database. 

## 7.5 Test Data Requirements 

### 7.5.1 Overview 

The Test Data Requirements describe the properties of the test data needed to execute the test procedures defined in the Test Procedure Specification. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **35**

Annex A.2.10 provides an outline of the Test Data Requirements, while Annexes [L.1 ](#annex-l-informative)and [L.2 ](#annex-l-informative)provide examples that demonstrate how Test Data Requirements could be developed for two different example projects. 

The contents of the Test Data Requirements include: 

### 7.5.2 Document specific information 

#### 7.5.2.1 Overview 

This information identifies the document and describes its origins and history. 

NOTE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.5.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.5.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.5.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.5.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change may be for example document author, project manager, system owner. 

### 7.5.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.5.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.5.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

© ISO/IEC 2013 – All rights reserved

**36** © IEEE 2013 – All rights reserved 

#### 7.5.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.5.4 Detailed test data requirements 

#### 7.5.4.1 Overview 

Describes the data required to execute the test procedures defined in the Test Procedure Specification. It may also contain any requirements to sanitize data. 

EXAMPLE Test data could describe simulated production data, such as customer data and user account data. 

This data may be divided into elements reflecting the data structure of the test item. 

EXAMPLE The data could be defined in a class diagram or an entity-relationship diagram. 

The information for the test data requirements includes: 

#### 7.5.4.2 Unique identifier 

Describes the unique identifier for the test data requirement so that it can be distinguished from all other test data requirements. An automated tool may control the generation of the identifiers or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test data requirement, because it is used for traceability purposes. 

#### 7.5.4.3 Description 

Defines the specific name and required values or ranges of values for each test data element. It may also describe when data needs to be made anonymous or manipulated in other ways. 

EXAMPLE “At least 10 customers must exist in the database with complete and correct CustomerID and all other mandatory customer information.” 

#### 7.5.4.4 Responsibility 

Specifies who is responsible for making the test data available. 

#### 7.5.4.5 Period needed 

Identifies when and for how long the test data is needed. Test data may be needed for a single undivided period or for several separate periods. 

#### 7.5.4.6 Resetting needs 

Specifies if the test data needs to be reset during testing. 

#### 7.5.4.7 Archiving or disposal 

Identifies when and how test data may be archived or disposed of after completion of the testing. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **37**

## 7.6 Test Environment Requirements 

### 7.6.1 Overview 

The Test Environment Requirements describe the properties of the test environment needed to execute the test procedures defined in the Test Procedure Specification. Where appropriate, this document may simply reference where the relevant information can be found. 

EXAMPLE The information could be found in the Organizational Test Strategy, Test Plan or Test Specification. 

Annex A.2.11 provides an outline of the Test Environment Requirements, while Annexes[ M.1 a](#annex-m-informative)nd[ M.2 ](#annex-m-informative)provide examples that demonstrate how Test Environment Requirements could be developed for two different example projects. 

The contents of the Test Environment Requirements document include: 

### 7.6.2 Document specific information 

#### 7.6.2.1 Overview 

This information identifies the document and describes its origins and history. 

EXAMPLE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.6.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.6.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.6.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.6.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.6.3 Introduction 

Provides explanatory information about the context and structure of the document. 

© ISO/IEC 2013 – All rights reserved

**38** © IEEE 2013 – All rights reserved 

#### 7.6.3.1 Scope Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.6.3.2 References Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.6.3.3 Glossary Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.6.4 Detailed test environment requirements 

#### 7.6.4.1 Overview Identifies the environment items required to execute the test procedures defined in the Test Procedure Specification. This includes set-up before the execution of the test procedures, for execution of the test procedures, and for any activities after test execution. 

EXAMPLE The environment items could be divided into the following types, although other types could be needed depending on the specific environment requirements: 

 Hardware; Middleware; 

 Software; Peripherals, e.g. printers; 

 Communication means, e.g. web access; Tools; 

 Security; Venue, e.g. size of rooms and background noise level; 

 Accessories, e.g. special pre-printed paper forms. NOTE The environment items could be grouped using other criteria, e.g. WindowsXP/Vista/Windows7 or different front ends connected to the PCs, if this is more appropriate. Descriptions of the specific configuration(s) where these items are to be used and/or reused could also be included. 

In practise the test environment will usually not be a perfect representation of the operational environment and the detailed environment requirements should reflect the degree to which the testing environment needs to represent the operational environment. 

The information for a test environment item includes: 

#### 7.6.4.2 Unique identifier Describes the unique identifier for the environment item so that it can be distinguished from all other environment items. An automated tool may control the generation of the identifiers or it may be done manually according to the appropriate notation scheme. The unique identifier is not to be changed during the lifetime of the test environment item, because it is used for traceability purposes. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **39**

#### 7.6.4.3 Description 

Identifies the environment item in sufficient detail for it to be delivered as expected. 

EXAMPLE This could include precisely named hardware or software in specific versions and specific configurations. It could also list required batch jobs that need to be run at certain points during testing to support the testing process. 

#### 7.6.4.4 Responsibility 

Specifies who is responsible for making the environment item available. 

#### 7.6.4.5 Period needed 

Identifies when and for how long the environment item is needed. An environment item may be needed for a single undivided period or for several separate periods. 

## 7.7 Test Data Readiness Report 

### 7.7.1 Overview 

The Test Data Readiness Report describes the fulfilment of each test data requirement. 

Annex A.2.12 provides an outline of the Test Data Readiness Report, while Annexes[ N.1 ](#annex-n-informative)and [N.2 ](#annex-n-informative)provide examples that demonstrate how Test Data Readiness Reports could be developed for two different example projects. 

The contents of the Test Data Readiness Report include: 

### 7.7.2 Document specific information 

#### 7.7.2.1 Overview 

This information identifies the document and describes its origins and history. 

EXAMPLE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.7.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.7.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.7.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.7.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

© ISO/IEC 2013 – All rights reserved

**40** © IEEE 2013 – All rights reserved 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.7.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.7.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.7.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.7.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.7.4 Test data status 

#### 7.7.4.1 Overview 

Provides a status for each test data requirement. This may be noted in a placeholder in the Test Data Requirements document. 

The information for each data item includes: 

#### 7.7.4.2 Unique identifier 

The unique identifier used in the Test Data Requirements document. 

#### 7.7.4.3 Description of status 

Describes the status of the required test data item. The status may include a description of how the actual test data deviates from the requirements, e.g. in terms of values or volume. 

## 7.8 Test Environment Readiness Report 

### 7.8.1 Overview 

The Test Environment Readiness Report describes the fulfilment of each test environment requirement. 

Annex A.2.13 provides an outline of the Test Environment Readiness Report, while Annexes O.1 and O.2 provide examples that demonstrate how Test Environment Readiness Reports could be developed for two different example projects. 

The contents of the Test Environment Readiness Report include: 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **41**

### 7.8.2 Document specific information 

#### 7.8.2.1 Overview 

This information identifies the document and describes its origins and history. 

EXAMPLE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.8.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.8.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.8.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.8.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.8.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.8.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.8.3.2 References 

Lists referenced documents and identify repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.8.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

© ISO/IEC 2013 – All rights reserved

**42** © IEEE 2013 – All rights reserved 

### 7.8.4 Test environment readiness 

#### 7.8.4.1 Overview 

Provides a fulfilment statement for each test environment requirement. This may be noted in a placeholder in the Test Environment Requirements document. 

The information for each environment item includes: 

#### 7.8.4.2 Unique identifier 

The unique identifier used in the Test Environment Requirements document. 

#### 7.8.4.3 Description of status 

Describes the fulfilment of the required test environment item. 

EXAMPLE The fulfilment statement could include a description of how the actual test environment deviates from the requirements, e.g. in terms of versions or configuration. 

NOTE This section could also be used to record the availability of certain test environment items (e.g. other applications that are integrated with the test item) as these could have an impact on testing if they are unavailable. 

## 7.9 Actual Results 

The actual results are a record of the result of the execution of a test case in a test procedure. The actual results are compared to the expected results to determine the test result. 

The actual results are not always formally recorded. Some types of systems (e.g. regulated safety critical) may be required to fully document the actual results, and some systems (e.g. those with high data integrity or reliability requirements) may choose to do full recording of actual results. The recording may be done by an automated tool during test execution. 

Some test cases may include actions that provide results, which are not part of the actual results of executing the test case, but intermediate results. These may be recorded separately in the test log or with the actual results. In the latter case a clear distinction must be made between the actual results and the intermediate results. 

When needed, the actual results are usually recorded directly in the test procedure in a placeholder reserved for this purpose. The actual results are therefore not usually considered as an independent document. 

## 7.10 Test Result 

The test result is a record of whether or not a specific test case execution has passed or failed, i.e. if the actual results correspond to the expected results or if deviations were observed, or if planned execution of the test case was not possible. 

The test result for a test case is usually recorded directly in the test procedure in a placeholder reserved for this purpose. The test result is therefore not usually considered as an independent document. 

EXAMPLE If the test case passes this could be marked with a tick mark or the like, and if the test case execution fails this could be marked with the number of the incident report raised as a result of the observation of the deviation. If the test case could not be executed this could be marked as "blocked"; in this case also record what the blockage is, if possible. 

Sometimes this process is fully automated, with the tool comparing the actual results to expected results, and providing a report of which test cases passed, failed, or could not be executed. 

NOTE Test Result is sometimes referred to as “Pass/Fail”. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **43**

## 7.11 Test Execution Log 

### 7.11.1 Overview 

Records details of the execution of one or more test procedures. 

The test procedures may be described in lists or in tables in a document or produced by a tool, e.g. a database or a dedicated test tool. 

Annex A.2.14 provides an outline of the Test Execution Log, while Annexes[ R.1 a](#annex-r-informative)nd[ R.2 p](#annex-r-informative)rovide examples that demonstrate how the Test Execution Log could be developed for two different example projects. 

The contents of the Test Execution Log include: 

### 7.11.2 Document specific information 

#### 7.11.2.1 Overview 

This information identifies the document and describes its origins and history. 

EXAMPLE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.11.2.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.11.2.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s) and the tester(s) if these are not the same. 

#### 7.11.2.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.11.2.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.11.3 Introduction 

Provides explanatory information about the context and structure of the document. 

#### 7.11.3.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

© ISO/IEC 2013 – All rights reserved

**44** © IEEE 2013 – All rights reserved 

#### 7.11.3.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.11.3.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.11.4 Events 

#### 7.11.4.1 Overview 

Lists the significant events encountered during the execution of one or more test procedures. 

EXAMPLE The first event could be the start of the test execution session, and the last event could be the final closing of the test execution session. 

Further examples of events to record include: 

 A sudden drop in performance of the computer on which the test is being executed; 

 A failure making further execution of the test impossible; 

 A disruption to the test environment causing the actual results to be unreliable. 

The information for each event recorded in the Test Execution Log includes: 

#### 7.11.4.2 Unique identifier 

Defines the sequential number of the entry in the Test Execution Log. 

#### 7.11.4.3 Time 

Defines the precise time, including date if necessary, when the event was encountered. 

#### 7.11.4.4 Description 

Describes what happened. This may include a reference to the test procedure and test case being executed when the event was encountered, if relevant. 

#### 7.11.4.5 Impact 

Describes the impact on test execution and/or the actual result, if relevant. 

## 7.12 Test Incident Reporting 

### 7.12.1 Overview 

A test incident is any issue that is noticed during testing that requires action(s) to be documented. Test incidents are recorded in incident reports. There will be one incident report for each unique incident (incident reports may also be known as defect reports, bug reports, fault reports, etc.). 

The incident reports may be documented in lists or in tables in a document or using a tool, e.g. a database or a dedicated bug-tracking tool. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **45**

The format of an incident report may be defined elsewhere in an organization, for example as part of the Incident Management Processes, in which case that definition should be used. 

### 7.12.2 Incident Report 

An Incident Report in this context documents an incident recognized during testing. 

| NOTE  | 1  | Incidents  |  | could  | occur,  | and  | be  |  | reported,  |  | in  | other  |  | contexts,  | e.g.,  |  | ambiguities  |  | in  | a  |  | business  |  | requirements  |  |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| specification discovered during software design, or a software failure occurring during production.  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |
| NOTE  | 2  | The  |  | information  | given  | here  | is  | only  | the  |  |  | information  |  | needed  | when  | an  | incident  |  |  | report  |  | is  | first  | raised.  | More  |

information could be added to the incident report as it passes through the wider incident management process. 

Annex A.2.15 provides an outline of the Incident Report, while Annexes[ S.1 ](#annex-s-informative)and [S.2 p](#s2-example-2--traditional-ltd)rovide examples that demonstrate how an Incident Report could be developed for two different example projects. 

The contents of the Incident Report include: 

### 7.12.3 Document specific information 

#### 7.12.3.1 Overview 

This information identifies the document and describes its origins and history. 

EXAMPLE The information could be placed on an early page in a document, or in a central place if the contents are kept in electronic form, e.g. in a database. 

#### 7.12.3.2 Unique identification of document 

Uniquely identifies a version of the document. 

EXAMPLE The unique identifier could include the title of the document, the date of issue, version, and/or document status (e.g. draft, reviewed, corrected, final). 

#### 7.12.3.3 Issuing organization 

Specifies the organization responsible for preparing and releasing the document. It may also include the author(s). 

#### 7.12.3.4 Approval authority 

Identifies the designated person(s) who have the responsibility for reviewing and signing off on the document (possibly electronically). It may also include the reviewers and pertinent managers. 

#### 7.12.3.5 Change history 

Includes a log of all of the changes that have occurred to the document since its inception. 

EXAMPLE 1 This could include a list including the present version of the document and any predecessor documents containing the unique identification of each document, description of document changes with respect to the previous document in the list, reason for changes, and the name and role of the person making the changes. 

EXAMPLE 2 Reasons for changes could include audit comments, team review, and system changes, and person making the change could be document author, project manager, system owner. 

### 7.12.4 Introduction 

Provides explanatory information about the context and structure of the document. 

© ISO/IEC 2013 – All rights reserved

**46** © IEEE 2013 – All rights reserved 

#### 7.12.4.1 Scope 

Identifies the extent of the coverage of the subject area by the document, and describes any inclusions, exclusions, assumptions and/or limitations. 

#### 7.12.4.2 References 

Lists referenced documents and identifies repositories for system, software, and test information. The references may be separated into “external” references that are imposed from outside the organization and “internal” references that are imposed from within the organization. 

#### 7.12.4.3 Glossary 

Provides a lexicon for the terms, abbreviations, and acronyms, if any, used in the document. 

NOTE This section could be an annex, or it could refer to another document providing a general glossary. All or part of the glossary and/or acronym list could be online, as a separate testing specific glossary or incorporated in a larger organizational glossary (including more terms than just those that are testing related). 

### 7.12.5 Incident details 

The information for the incident, when it is first recognized and reported, includes: 

#### 7.12.5.1 Timing information 

Records the date (and possibly also the time) when the incident was first observed. 

#### 7.12.5.2 Originator 

Specifies the name(s) and title(s) of the individual(s) who identified the incident. 

#### 7.12.5.3 Context 

Identifies the context in which the incident was observed. 

EXAMPLE This could include: 

 Configuration Item, including its unique identification, in which the incident was observed. In a testing context the item will usually be the test item, but it might be another configuration item, for example the Test Specification; 

 The Test Procedure and Test Case, including their unique identifiers, being executed when the incident was observed; 

 Any relevant information about the test environment and/or test data not included in other documents and considered especially significant by the tester; 

 The test process or sub-process in which the incident was observed. 

#### 7.12.5.4 Description of the incident 

Provides a detailed description of the incident. Indicates if the incident is reproducible, and, if so, provides enough information to reproduce it. 

Related information and observations that may help to isolate and correct the cause of the incident may be included. 

The description may also reference the location(s) where additional evidence or supporting information can be found to aid in diagnosis of the incident. 

EXAMPLE Such evidence could include screenshots, system logs and output files. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **47**

#### 7.12.5.5 Originator’s assessment of severity 

Indicates, from the originator’s point of view, the depth and breadth of the impact this incident will have on technical and business issues. This may include an estimate of the time and effort to fix the associated defect. 

EXAMPLE Technical and business issues could be the user’s ability to perform tasks and system operations. 

Also identifies the existence of any known workarounds. 

#### 7.12.5.6 Originator’s assessment of priority 

Provides an evaluation of the urgency for the repair. Most organizations have from three to five categories. 

EXAMPLE A categorization scheme could be that the most serious category, e.g. “Fix now”, means that the product is unusable, and the least serious, e.g. “Fix in support”, is a cosmetic incident. 

| **7.12.5.7**  | **Risk**  |
| ---: | --- |
| Provides  | information on the introduction of new risks or changes to the status of existing risks, where  |
| applicable.  |  |
| **7.12.5.8**  | **Status of the incident**  |

Identifies the current status of the incident, which will be “Open” or similar in this context. 

NOTE A common sequence for incidents as they progress through their life cycles could be: “Open”, “Approved for resolution”, “Assigned for resolution”, “Fixed”, “Retested with the fix confirmed”, and “Closed”. Other possible status values could be “Rejected” or “Withdrawn”. 

© ISO/IEC 2013 – All rights reserved

**48** © IEEE 2013 – All rights reserved 

# Annex A (informative) 

#  Overview and Outlines of Documents 

## A.1 Overview 

Figure A.1 shows that context for test documentation is set by the Organizational Test Policy. The Dynamic Test documentation is developed within the context of the test management documentation for a particular project. 

**Organizational Test Documentation**

### Test Policy Found in clause 5.2

Organizational Organizational

## Test Strategy … Test Strategy 5.3

**Test Management Documentation**

|  | Test Plan |  | Test Plan |  | Test Plan |  |
| ---: | --- | --- | --- | --- | --- | ---: |
|  | (Project) | **…** | (Project) | **…** | (Project) | 6.2 |
| **…** | **…** | **…** | **…** | **…** | **…** | **…** |
|  | Test Plan(Sub-process) | **…** | Test Plan(Sub-process) | **…** | Test Plan(Sub-process) | **…**6.2 |
| **…** |  |  |  |  |  | **…** |
|  |  |  |  |  |  | 7.2 - 7.4 |
| 7.6 |  |  |  |  |  | 7.5 |
| 7.8 |  |  |  |  |  | 7.7 |

| **Dynamic Test Documentation**Test SpecificationTest Environment Test DataRequirement RequirementTest Environment Test DataReadiness Report Readiness ReportPerformDynamic Test Incident Test ExecutionReport Documentation 7.9 –Test Status Report | **Dynamic Test Documentation**Test SpecificationTest Environment Test DataRequirement RequirementTest Environment Test DataReadiness Report Readiness ReportPerformDynamic Test Incident Test ExecutionReport Documentation 7.9 –Test Status Report |
| --- | --- |

### 7.12 7.9 – 7.11

### 6.3

| **…** | Test Completion Report |  |
| --- | --- | ---: |
|  | (Sub-process) | 6.4 |
| **Test Management**  | **Test Management**  | **Test Management**  |
| **Documentation,**  | Test Completion Report |  |
| **cont.** | (Project) | 6.4 |

### Figure A.1 — The hierarchy of test documentation 

Figure A.2 shows the hierarchy between the contents of the documents produced in completing the _Test Design and Implementation_ process outlined in ISO/IEC/IEEE 29119-2. 

© ISO/IEC 2013 – All rights reserved 

## © IEEE 2013 – All rights reserved 49

![](data:image/jpeg;base64,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wooAwrnwtp1x44tPF7vP/aFpZSWUahh5fluwYkjGc5HrXNa58KNJvdcvtW0rXfEHh6XUju1CPS7zyY7lu7spBwxHUrg16FRQBwOrfCXwleeE9M8PWcV3pUekzfaLC7spylxBKfvOJDkktnnOc1Um+D+jXz2t1reveIdY1G0u4rm2vLy7DPCY2DBUUKEUEgZwuTgc8V6TRQBx/iDwBp+q+O9P8ZQ6pqum6laRJBKLSYJHdRK+8RyqQdy5J/OptD8BaDpdp4hszHJeWviC8lu76G5IdGaQAMoGB8uBXVUUAeWp8EtAaGHTbzxB4mvtAgkDx6NcagWtQAchCMbmQYGFLYrsNU8H6TqHiXQNfkM0VzoQlFmkTBY8SJsIK46ADjGK6KigDC1nwtp2q+K9E8SXMlwt5ovnfZlRgEPmrtbcMc8Dit2iigDifG//ACUbwH/19Xn/AKTNXbVxPjj/AJKN4C/6+7z/ANJXrtqACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA4X4y5/s/w3j/oZbD/ANGV3VcL8ZM/YPDWP+hlsP8A0ZXdUAFFFFABXD/C7/kM+OM/9DHJ/wCiIa7iuH+FvOseOP8AsY5P/RENAHcVyPjT/kdPBP8A2ELj/wBJZa66uR8af8jp4J/7CFx/6Sy0AddRQKKACiijIoAKKMikyPWgBaKKM0AFFGaM0AFFAIPSgkCgAooFGRQAUUZGcZooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOK8bDPxG8B8dLq8P8A5LNXa1xPjbP/AAsjwIB/z83h/wDJZq7agAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAOF+Mn/Hj4ZH/AFMth/6Ga7quF+Mn/Hl4Z/7GWw/9DNd1QAUUUUAFcP8AC3/kL+OP+xjl/wDRENdxXD/C3/kL+OP+xjl/9EQ0AdxXI+NP+R08E/8AYQuP/SWWuurkfGf/ACOngr/r/uP/AElloA64UUUUAFc8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K/8ACaw/9C14p/8ABTJS/wDCaxHp4a8Un/uFOP511NFAHK/8JrH38MeKv/BW/wDjQfGsfbwx4qP/AHC2/wAa6qigDlf+E1j/AOhY8Uj/ALhbf40v/Caw/wDQteKf/BU9dTRQBy3/AAmsP/QteKf/AAVSUf8ACaw/9C34p/8ABTJXU0UAebeB/EL6Ppd7Be+GfFCvNql5crt0qRvkknd1PHsw4re/4Tm27eG/Ff8A4Jpf8K6uigDlf+E3t/8AoW/FX/gnl/woHjaA/wDMt+Kf/BTJXVUUAct/wmsP/QteKf8AwVSUf8JpH/0LPin/AMFb/wCNdTRQByp8axgZHhfxUfppjf40weOBnH/CI+LR/wBw3/7KutooA838b+KbnWPB+s6TZ+C/FxuLyymgi3acFXcyEDJ39Mmu80SOSHRbGGVSkkdvGrqexCgEVcooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAK5v4oSGP4deIGVtrHT5kB9CyFR/Oukrj/jBNt8FNZgZe/vrSzUZ6+ZcRqf/AB3dQAfBe2ex+GGiabI4d7CFrJmAxuMLtETjtnZXYVx/wzn2S+JdHYnfp2tzgKR/BNtuFP0/fH8q7CgAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiisLxp4lh8Mafb3Umn3+oSXNyltDb2UavK7sCRgMQOx70AbtFcMnjzWHXK/DTxfj3S2U/kZqX/hOtaz/yTTxb/wB82v8A8eoA7iiuKXxtrjDI+GvirHu1oP8A2tQPGmuk4Hw18U/i9oP/AGvQB2tFcX/wmXiAdfhp4n/7/Wf/AMfoPjLxBjj4aeJj/wBtrMf+16AO0ori/wDhMtfxz8NfEw/7a2Z/9r0v/CZa/wD9E18T/wDf2z/+P0AdnRXGf8Jlrw6/DXxP/wB/bP8A+P0HxnrwGT8N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pCf727nPXIrqvBXw70Xw1d6lqLXF/rGq6moS8v8AUphNNIg/g6AKn+yBisAfBXQUtZtJh17xLF4emdpDoqX2LUFjnA+XcEzztzigDgrc4+E/wKcnga5p+T/wBxXb/tHyRraeCFLgO3i+w2g9Tgtmugvvhl4cvvh1YeBrg339n6csf2OdZttzC8f3JFcAYYeuPwrNf4PaJd3un6hrmu+I9cv9OuYrm0ub29DmExsGCqoUKAxA3HGTjrQBzGmadY3/AO114j+22UV0I/DsBHmxB1QllHccEjNYQfxpN+0f4vPh7SvD97dabZ2kFnHqszw/Z7UoDmEKp4Lk5PHpXp1vY2enfHW4u4Y5GutY0PfcO0nyqIJVVQq44z5hySe1XfG3w70fxNrNprovNT0fW7SMxxajptx5M2zrsbIIdc9iKAOA8IaV4vi+OT634j/4RXS57vRXiubDTb5mluQrZSZo2UE4OV3V6H8Gf+SWeHP+vFKh8IfD3SPDN/qGt/bNT1fWryIRzajqVx502wchFwAFXPYCpfguc/Cvw6f+nJf5mgDr6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArjviscWHh8/8AUx6f/wCjxXY1xvxY407QP+xj07/0etAHZUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACMSBkVzvw5s9C0/wtBaeHL03unLLMyTGQPljK5cZAHRyw/CuibpXO/Dnw+fDHhaHRzeJeGOaeTzVTaD5krvjGT03Y/CgDo6KKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDAnv9OTx3aaU+nhtTk02WeO62L8sSyRqybuvJZTjpxW/WBPBox8c2l3Jcka0unSpDDu6wGSMu2MdmCDPvW/QAyf8A1En+6f5VyfwX/wCSWeHv+vQfzNdbN/qX/wB01yXwY/5JdoH/AF64/wDHjQB19FFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAVxnxa/wCQ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)

**Figure A.2 — The hierarchy of test design and implementation documentation** 

### A.2 Document Outlines 

**A.2.1 Overview** 

The outlines of the contents of each of the defined documents are provided below. 

All documents include the following: 

© ISO/IEC 2013 – All rights reserved

**50** © IEEE 2013 – All rights reserved 

Document specific information: 

    1. Unique identification of document 

<div></div>

    1. Issuing organization 

<div></div>

    1. Approval authority 

<div></div>

    1. Change history 

Introduction: 

    1. Scope 

<div></div>

    1. References 

<div></div>

    1. Glossary 

The position of this information in the documents could vary from organization to organization and within an organization from document to document. 

The specific document contents are usually placed after the Introduction. 

**A.2.2 Organizational Test Policy** 

The outline of the Test Policy specific information is: 

1. Test policy statements: 

    1. Objectives of testing 

<div></div>

    1. Test process 

<div></div>

    1. Test organization structure 

<div></div>

    1. Tester training 

<div></div>

    1. Tester ethics 

<div></div>

    1. Standards 

<div></div>

    1. Other relevant policies 

viii) Measuring the value of testing 

    1. Test asset archiving and reuse 

<div></div>

    1. Test process improvement 

**A.2.3 Organizational Test Strategy** 

The outline of the Organizational Test Strategy specific information is: 

1. Project-wide organizational test strategy statements: 

    1. Generic risk management 

<div></div>

    1. Test selection and prioritization 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **51** 

    1. Test documentation and reporting 

<div></div>

    1. Test automation and tools 

<div></div>

    1. Configuration management of test work products 

<div></div>

    1. Incident management 

<div></div>

    1. Test sub-processes 

1. Test sub-process-specific organizational test strategy statements: 

    1. Entry and exit criteria 

<div></div>

    1. Test completion criteria 

<div></div>

    1. Test documentation and reporting 

<div></div>

    1. Degree of independence 

<div></div>

    1. Test design techniques 

<div></div>

    1. Test environment 

<div></div>

    1. Metrics to be collected 

viii) Retesting and regression testing 

**A.2.4 Test Plan** 

The outline of the Test Plan specific information is: 

1. Context of the testing: 

    1. Project/Test sub-process 

<div></div>

    1. Test item(s) 

<div></div>

    1. Test scope 

<div></div>

    1. Assumptions and constraints 

<div></div>

    1. Stakeholders 

1. Testing communication 

<div></div>

1. Risk register: 

    1. Product risks 

<div></div>

    1. Project risks 

1. Test strategy: 

    1. Test sub-processes 

<div></div>

    1. Test deliverables 

© ISO/IEC 2013 – All rights reserved

**52** © IEEE 2013 – All rights reserved 

    1. Test design techniques 

<div></div>

    1. Test completion criteria 

<div></div>

    1. Metrics to be collected 

<div></div>

    1. Test data requirements 

<div></div>

    1. Test environment requirements 

<div></div>

    1. Retesting and regression testing 

<div></div>

    1. Suspension and resumption criteria 

xiii) Deviations from the Organizational Test Strategy 

1. Testing activities and estimates 

<div></div>

1. Staffing: 

    1. Roles, activities, and responsibilities 

<div></div>

    1. Hiring needs 

<div></div>

    1. Training needs 

1. Schedule 

**A.2.5 Test Status Report** 

The outline of the Test Status Report specific information is: 

1. Test status: 

    1. Reporting period 

<div></div>

    1. Progress against Test Plan 

<div></div>

    1. Factors blocking progress 

<div></div>

    1. Test measures 

<div></div>

    1. New and changed risks 

<div></div>

    1. Planned testing 

**A.2.6 Test Completion Report** 

The outline of the Test Completion Report specific information is: 

1. Testing performed: 

    1. Summary of testing performed 

<div></div>

    1. Deviations from planned testing 

<div></div>

    1. Test completion evaluation 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **53** 

    1. Factors that blocked progress 

<div></div>

    1. Test measures 

<div></div>

    1. Residual risks 

<div></div>

    1. Test deliverables 

viii) Reusable test assets 

    1. Lessons learned 

**A.2.7 Test Design Specification** 

The outline of the Test Design Specification specific information is: 

1. Feature sets: 

    1. Unique identifier 

<div></div>

    1. Objective 

<div></div>

    1. Priority 

<div></div>

    1. Specific strategy 

<div></div>

    1. Traceability 

1. Test conditions: 

    1. Unique identifier 

<div></div>

    1. Description 

<div></div>

    1. Priority 

<div></div>

    1. Traceability 

**A.2.8 Test Case Specification** 

The outline of the Test Case Specification specific information is: 

1. Test coverage items: 

    1. Unique identifier 

<div></div>

    1. Description 

<div></div>

    1. Priority 

<div></div>

    1. Traceability 

1. Test cases: 

    1. Unique identifier 

<div></div>

    1. Objective 

<div></div>

    1. Priority 

© ISO/IEC 2013 – All rights reserved

**54** © IEEE 2013 – All rights reserved 

    1. Traceability 

<div></div>

    1. Preconditions 

<div></div>

    1. Inputs 

<div></div>

    1. Expected results 

viii) Actual results and test result 

**A.2.9 Test Procedure Specification** 

The outline of the Test Procedure Specification specific information is: 

1. Test sets: 

    1. Unique identifier 

<div></div>

    1. Objective 

<div></div>

    1. Priority 

<div></div>

    1. Contents (Traceability) 

1. Test procedures: 

    1. Unique identifier 

<div></div>

    1. Objective 

<div></div>

    1. Priority 

<div></div>

    1. Start up 

<div></div>

    1. Test cases to be executed (Traceability) 

<div></div>

    1. Relationship to other procedures 

<div></div>

    1. Stop and wrap up 

**A.2.10 Test Data Requirements** 

The outline of the Test Data Requirements specific information is: 

1. Detailed test data requirements: 

    1. Unique identifier 

<div></div>

    1. Description 

<div></div>

    1. Responsibility 

<div></div>

    1. Period needed 

<div></div>

    1. Resetting needs 

<div></div>

    1. Archiving or disposal 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **55** 

**A.2.11 Test Environment Requirements** 

The outline of the Test Environment Requirements specific information is: 

1. Detailed test environment requirements: 

    1. Unique identifier 

<div></div>

    1. Description 

<div></div>

    1. Responsibility 

<div></div>

    1. Period needed 

**A.2.12 Test Data Readiness Report** 

The outline of the Test Data Readiness Report specific information is: 

1. Test data status: 

    1. Unique identifier 

<div></div>

    1. Description of status 

| **A.2.13**  | **Test Environment Readiness Report**  |
| ---: | --- |
| The outline of the Test Environment Readiness Report specific information is: a)  | Test environment status: i) Unique identifier  |
| **A.2.14**  | ii) Description of status **Test Execution Log**  |

The outline of the Test Execution Log specific information is: 

1. Events: 

    1. Unique identifier 

<div></div>

    1. Time 

<div></div>

    1. Description 

<div></div>

    1. Impact 

**A.2.15 Incident Report** 

The outline of the Incident Report (recognition state) specific information is: 

1. Incident details: 

    1. Timing information 

<div></div>

    1. Originator 

© ISO/IEC 2013 – All rights reserved

**56** © IEEE 2013 – All rights reserved 

1. Context 

<div></div>

1. Description of the incident 

<div></div>

1. Originator’s assessment of severity 

<div></div>

1. Originator’s assessment of priority 

<div></div>

1. Risk 

viii) Status of the incident 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **57**

# Annex B (informative) 

### ISO/IEC/IEEE 29119-2 Normative Requirements Mapped to 

### ISO/IEC/IEEE 29119-3 Information Items 

### B.1 Mapping 

This informative annex explains at a high level how ISO/IEC/IEEE 29119-2 activities map to the information items in the documentation templates defined in ISO/IEC/IEEE 29119-3. For users of ISO/IEC/IEEE 29119-3 that do not use ISO/IEC/IEEE 29119-2, this annex is optional. 

The table below summarizes the normative requirements for the clauses in ISO/IEC/IEEE 29119-2 where the creation of the ISO/IEC/IEEE 29119-3 information item is described. 

**Table B.1 — Summary of normative requirements from ISO/IEC/IEEE 29119-2 where an information** 

**item from ISO/IEC/IEEE 29119-3 is described** 

| **ISO/IE/IEEE 29119-3 Information Items**  | **Normative requirement**  |
| --- | --- |
| **B.1.1 Organizational Test Policy**  |   |
| a) Test policy statements:  |   |
| i) Objectives of testing  | Shall  |
| ii) Test process  | May  |
| iii) Test organization structure  | May  |
| iv) Tester training  | May  |
| v) Tester ethics  | May  |
| vi) Standards  | May  |
| vii) Other relevant policies  | May  |
| viii) Measuring the value of testing  | May  |
| ix) Test asset archiving and reuse  | May  |
| x) Test process improvement  | May  |
| **B.1.2 Organizational Test Strategy**  |   |
| a) Project-wide organizational test strategy statements:  |   |
| i) Generic risk management  | Shall  |
| ii) Test selection and prioritization  | Shall  |
| iii) Test documentation and reporting  | May  |
| iv) Test automation and tools  | May  |
| v) Configuration management of test work products  | May  |
| vi) Incident management  | May  |
| vii) Test sub-processes  | May  |
| b) Test sub-process-specific organizational test strategy statements:  |   |
| i) Entry and exit criteria  | May  |
| ii) Test completion criteria  | May  |
| iii) Test documentation and reporting  | May  |

© ISO/IEC 2013 – All rights reserved

**58** © IEEE 2013 – All rights reserved 

| **ISO/IE/IEEE 29119-3 Information Items**  | **Normative requirement**  |
| --- | --- |
| iv) Degree of independence  | May  |
| v) Test design techniques  | May  |
| vi) Test environment  | May  |
| vii) Metrics to be collected  | May  |
| viii) Retesting and regression testing  | May  |
| **B.1.3 Test Plan**  | Shall  |
| a) Context of the testing:  | Shall  |
| i) Project(s)/Test sub-process(es)  | Shall  |
| ii) Test item(s)  | Shall  |
| iii) Test scope  | Shall  |
| iv) Assumptions and constraints  | Should  |
| v) Stakeholders  | Should  |
| b) Testing communication  | Should  |
| c) Risk register:  | Shall  |
| i) Product risks  | Shall  |
| ii) Project risks  | Shall  |
| d) Test strategy:  | Shall  |
| i) Test sub-processes  | Shall  |
| ii) Test deliverables  | Shall  |
| iii) Test design techniques  | Shall  |
| iv) Test completion criteria  | Shall  |
| v) Metrics to be collected  | Shall  |
| vi) Test data requirements  | Shall  |
| vii) Test environment requirements  | Shall  |
| viii) Retesting and regression testing  | Shall  |
| ix) Suspension and resumption criteria  | Shall  |
| x) Deviations from the Organizational Test Strategy  | Should  |
| e) Testing activities and estimates  | Shall  |
| f) Staffing:  | Should  |
| i) Roles, activities, and responsibilities  | Should  |
| ii) Hiring needs  | Should  |
| iii) Training needs  | Should  |
| g) Schedule  | Shall  |
| **B.1.4 Test Status Report**  | Shall  |
| a) Test status:  | Shall  |
| i) Reporting period  | Shall  |
| ii) Progress against Test Plan  | Shall  |
| iii) Factors blocking progress  | Shall  |
| iv) Test measures  | Shall  |
| v) New and changed risks  | Shall  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **59**

| **ISO/IE/IEEE 29119-3 Information Items**  | **Normative requirement**  |
| --- | --- |
| **B.1.5 Test Completion Report**  | Shall  |
| a) Testing performed:  | Shall  |
| i) Summary of testing performed  | Shall  |
| ii) Deviations from planned testing  | Shall  |
| iii) Test completion evaluation  | Shall  |
| iv) Factors that blocked progress  | Shall  |
| v) Test measures  | Shall  |
| vi) Residual risks  | Shall  |
| vii) Test deliverables  | Shall  |
| viii) Reusable test assets  | Should  |
| ix) Lessons learned  | Shall  |
| **B.1.6 Test Design Specification**  | Shall  |
| a) Feature sets:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Objective  | Shall  |
| iii) Priority  | Shall  |
| iv) Extract of strategy  | Shall  |
| v) Traceability  | Shall  |
| b) Test conditions:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description  | Shall  |
| iii) Priority  | Shall  |
| iv) Traceability  | Shall  |
| **B.1.7 Test Case Specification**  | Shall  |
| a) Test coverage items:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description  | Shall  |
| iii) Priority  | Shall  |
| iv) Traceability  | Shall  |
| b) Test cases:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Objective  | Should  |
| iii) Priority  | Shall  |
| iv) Traceability  | Shall  |
| v) Preconditions  | Shall  |
| vi) Inputs  | Shall  |
| vii) Expected results  | Shall  |
| viii) Actual results and test result  | Shall  |
| **B.1.8 Test Procedure Specification**  | Shall  |
| a) Test sets:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Objective  | Shall  |

© ISO/IEC 2013 – All rights reserved

**60** © IEEE 2013 – All rights reserved 

| **ISO/IE/IEEE 29119-3 Information Items**  | **Normative requirement**  |
| --- | --- |
| iii) Priority  | Shall  |
| iv) Contents (Traceability)  | Shall  |
| b) Test procedures:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Objective  | Shall  |
| iii) Priority  | Shall  |
| iv) Start up  | Shall  |
| v) Test cases to be executed (Traceability)  | Shall  |
| vi) Relationship to other procedures  | Shall  |
| vii) Stop and wrap up  | Shall  |
| **B.1.9 Test Data Requirements**  | Shall  |
| a) Detailed test data requirements:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description  | Shall  |
| iii) Responsibility  | Shall  |
| iv) Period needed  | Shall  |
| v) Resetting needs  | Shall  |
| vi) Archiving or disposal  | Shall  |
| **B.1.10 Test Environment Requirements**  | Shall  |
| a) Detailed test environment requirements:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description  | Shall  |
| iii) Responsibility  | Shall  |
| iv) Period needed  | Shall  |
| **B.1.11 Test Data Readiness Report**  | Shall  |
| a) Test data status:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description of status  | Shall  |
| **B.1.12 Test Environment Readiness Report**  | Shall  |
| a) Test environment status:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Description of status  | Shall  |
| **B.1.13 Test Execution Log**  | Shall  |
| a) Events:  | Shall  |
| i) Unique identifier  | Shall  |
| ii) Time  | Shall  |
| iii) Description  | Shall  |
| iv) Impact  | Shall  |
| **B.1.14 Incident Report**  | Shall  |
| a) Incident details:  | Shall  |
| i) Timing information  | Shall  |
| ii) Originator  | Shall  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **61**

| **ISO/IE/IEEE 29119-3 Information Items**  | **Normative requirement**  |
| --- | --- |
| iii) Context  | Shall  |
| iv) Description of the incident  | Shall  |
| v) Originator’s assessment of severity  | Shall  |
| vi) Originator’s assessment of priority  | Shall  |
| vii) Risk  | Shall  |
| viii) Status of the incident  | Shall  |

© ISO/IEC 2013 – All rights reserved

**62** © IEEE 2013 – All rights reserved 

# Annex C (informative) 

###  Overview of Examples 

### C.1 Overview 

[Annexes D ](#annex-d-informative)to[ S ](#annex-s-informative)contain examples of the application of the templates on both agile and traditional projects, to demonstrate the applicability of this standard to both types of projects. It should be noted that these are examples only, and many variations are possible and likely. 

Particularly this is the case in agile projects. The reduced (more agile) information items presented in the agile examples are 'lightweight' versions of the information items. This approach is acceptable because of the lower perceived development risks, whereas the 'heavyweight' versions presented for the other examples are related to the higher needs for assurance in the lifecycle. 

Any project can tailor documentation from full (all documents) to a minimal set of test documents, where minimal would be project defined. 

NOTE The word “shall” appears in some of the example documentation. These “shall”s are example wordings only and not normative. 

The example documentation is based around two example projects: 

**Agile Corporation** is a large publication organization producing magazines and books. The Corporation has an internal IT department, which is responsible for all the IT products that are in use by the organization, in supporting them in their business. Projects are run by a single agile team, so there are no projects performed using traditional development methods. The organization has several years of experience working in this way, and finds that it works really well with their needs for new and enhanced IT systems to support the business. 

The project featured in this example is the development of a new web-based subscription system allowing people to become subscribers and allowing existing subscribers to change their personal information and order new or extended subscriptions. 

**Traditional Ltd** is a small company that produces advanced analysis equipment for the farming industry. Some of their products are critical, in the sense that wrong analysis results could cause prescription of wrong doses of fertilizer (either too much or too little). The organization is hence required to produce the product according to a specific standard that state requirements concerning production and quality assurance of certain documents and traceability between work product elements. 

The project featured in this example is the development of the PC-part of a product called UV/TIT-14 33a. It is an apparatus to measure fertilizer components and their concentration in earth samples. The apparatus has a user interface working on a PC with wireless connection to the measuring system. 

Not all of the example documents include the sections for Document Specific Information or Introduction; this is because this information is company-specific and the examples focus on the testing contents of the documents. 

The examples might not be internally consistent; each section is to be regarded as an independent example of the information related to the topic (heading). 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **63**

The examples are not necessarily complete. Where paragraphs have been left out this is marked by three vertical dots, like this: 

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAA3ABEDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LFFVZYb5tUtp4ryNLJIZFntjBuaVyU2OHz8oUK4Iwd28cjbzaoAKKKKAAUVBJBK99BcLezxxRxuj2yqnlyliuGYlSwK7SBtYD5zkH5cT0AFFFFAAKKpT6f52t2eqfbb1Ps1vND9mSbEEvmGM73T+J18rCnsHf14u0AFFFFAAKKKKACiiigD/2Q==)

Omitted text is identified with an ellipsis, like this "**…**". 

© ISO/IEC 2013 – All rights reserved

**64** © IEEE 2013 – All rights reserved 

# Annex D (informative) 

###  Test Policy 

### D.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

**Test Policy for Agile Corporation, V1.2 (02/13/2009)** 

**Issued by:** Ursula Mayers, Head of Development 

**Approved by:** Stephan Blacksmith, Head of QA 

**Scope:** This Test Policy describes the corporate view of testing for Agile Corporation and provides a framework within which all testing carried out on all internal projects within the organization will be performed. 

**Introduction:** Agile Corp recognizes the need for testing of its internal products. The cost of developing high quality software systems can be considered as falling into four categories: prevention costs, testing costs, internal failure costs and external failure costs. It is generally cheaper to prevent defects than detect them and fix them (testing costs plus internal failure costs), and the highest cost is of external failure when detected by the users. To avoid this Agile Corp practices Test-Driven Development (TDD) and Acceptance Test-Driven development (ATDD), which are software development techniques. In its implementation of TDD, Agile Corp uses white-box techniques as defined in ISO/IEC/IEEE 29119 part 4. 

**Objectives of testing:** The objective of testing is to provide sufficient information to determine the current quality of the system under test. As such all activities aimed at achieving this are considered to be software testing activities (e.g. integration, system, acceptance and regression testing). 

**Test process:** The software testing will be based on test processes as defined in ISO/IEC/IEEE 29119-2 and aligned with the development approach_._ 

**Test organization structure**: Testing will be resourced within the Agile Corp from a central pool of testers who are assigned to the project. In addition, a central ‘expert’ software testing resource led by the Head of Testing will provide test consultancy services to projects as necessary. Test organization structure inside of a project will follow project guidance. 

**Tester training:** All members of testing teams are expected to have appropriate university education or at least a minimum level of industry certification in software testing. Additionally, testers are expected to be knowledgeable in agile concepts, or to become so within three months of joining a test team. 

**Standards:** Test documentation will be based on ISO/IEC/IEEE standard 29119-3 "Test Documentation", adapted for use in agile projects. 

**Other relevant policies:** Software Development Policy for Agile Corporation, V4.3 (12/12/2008) 

**Test process improvement and value determination:** End of iteration retrospectives will capture lessons learned, metrics, and improvement concepts which will be provided to the central test organization. 

### D.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment for the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **65**

This policy is published on the Traditional intranet under Management \>\> Policies. Hence it does not contain all the document related information, and it is not versioned, but a publishing date is visible. 

### Test Policy 

### Objective and definition of test 

At Traditional Ltd, testing is considered as a means to achieving user and customer confidence in our products. Testing is one of many means to achieve this goal. 

### Testing process 

Any software project must include a test project. In other words, the test project must be a subproject of a corresponding software project. 

The two projects should be started at the same time. The test process includes the activities: planning, analysis and design of test material, execution and recording of the test including registration of any incidents, and test completion and reporting. Testing is affecting something (object under test), observing the effect and deciding whether this effect is considered correct or incorrect behaviour. 

### Organization 

Each project will be staffed by analysts, designers, programmers, and test analysts. They will all report to the project manager. Students could be hired to execute tests. 

### Evaluation of testing 

For each product, management should decide which level of quality is to be achieved expressed as the maximum number of incident reports over a given period from customers. 

At the release of a product the test group must deliver a report on the product’s expected behaviour. One year after release, management reviews this report and compares it with respect to feedback from the market (number of incident reports, number of failures.) 

### Standards 

We follow our own standards found on the intranet. These are all based on ISO/IEC/IEEE standard 29119-3 "Test Documentation". 

### Policies in Traditional Ltd 

The policies for Software Development and Quality Assurance form the basis for all software development and testing in Traditional Ltd. 

### Approach to test process improvement 

At the release of a product the test group must deliver a report which analyses the project from a testing point of view. Any improvements suggested in this report are discussed with management in order to decide which improvements to make. 

When the evaluation of the testing takes place one year after release, management considers if improvements should take place. 

© ISO/IEC 2013 – All rights reserved

**66** © IEEE 2013 – All rights reserved 

# Annex E (informative) 

###  Organizational Test Strategy 

### E.1 Example 1 – Agile Corporation 

Agile Corporat[ion is a lar](#annex-c-informative)ge publication organisation producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

**Organizational Test Strategy for Agile Corporation, V1.1 (03/23/2009)** 

**Issued by:** Ursula Mayers, Head of Development **Approved by:** Stephan Blacksmith, Head of QA 

**Issuing organization:** The head of testing at Agile Corporation is responsible for preparing the Organizational Test Strategy. Upon review and approval, the senior management at Agile Corporation is responsible for distributing the Organizational Test Strategy. 

**Scope:** This Organizational Test Strategy provides the Corporation’s overall approach to testing. We have developed and implemented several guidelines that are applicable across all projects. We aim to provide testing at every point in the system and software lifecycle. This is accomplished by having our test group engaged early in the lifecycle process, participating in teams with developers, and working with user stories even in a draft state. These pertinent artefacts provide the basis for establishing test plans and scoping the test effort. In addition to the development of test plans, the organization will use agile test activities such as stakeholder involvement in test design, preparing test automation, peer reviews, various testing design techniques (project applicable), lightweight defect tracking and reporting. 

**References:** Agile Manifesto 

**Generic risk management:** All risk management must follow the prescribed corporate Risk Management process as defined in Corporate Policy-RM56, where the general risk register is identified. Any deviations and waivers must be approved by senior management. 

**Degree of independence:** The Corporation test organization is led by the head of testing who has no direct association with the head of development. The test organization is technically, managerially, and financially independent from the development organization of Agile Corp, while within a project assigned testers could participate directly in self-organized teams, which include development. 

**Test organization structure:** Agile Corporation Test Organization has a pool of independent test professionals from which testers are assigned to agile teams, e.g. a scrum team, where testers are members of the overall team. 

Head of Tes ng (1 resource)

Testers Test Environment 

(21 resources) Administrators (5 resources) 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **67**

**Test documentation strategy:** The Test Organization will comply with the test documentation defined in ISO/IEC/IEEE 29119-3, and the principles of agile development. Any deviations will require the approval of the head of testing. 

**Test sub-processes documented in project test plans:** The Corporation relies on our highly competent head of testing to help ensure the most effective type of testing is invoked. This is accomplished via a mentoring program with the testers on scrum teams, and it includes functional and non-functional methods, test design techniques, and testing tools, tailored from ISO/IEC/IEEE 29119-1, -2, and -4. Additionally each project defines test selection, priority and management. Further, the project must select their own test environments, retest/regression practices, and incident management practices. These items are agreed during continuous direct interaction with stakeholders over the life of each project. The level of test plan documentation (size and format) is also agreed with project stakeholders. 

### E.2 Example 2 – Traditional Ltd 

Traditional Ltd is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

Traditional Ltd has an organizational test strategy with a project-wide part, and a part for each test sub- process. This example only includes the project-wide part and the parts for component test and system test. 

© ISO/IEC 2013 – All rights reserved

**68** © IEEE 2013 – All rights reserved 

### Organizational Test Strategy 

| **Organizational Test Strategy**  | **Organizational Test Strategy**  |
| --- | --- |
| **Issue**  | **Strategy**  |
| Generic risk management  | The risk management in a project must be based on the generic risk register for the specific type of project and the generic risk management process. The risk registers are found in XX. When a project is closing down the relevant generic risk register(s) must be updated as appropriate.  |
| Test selection and prioritization  | Test cases and test procedures will be prioritized according to the risk associated with the requirements the cases are covering. If a test procedure includes test cases with different risk levels, the test case with the highest level determines the risk level for the entire procedure. Execution of test procedures must always be scheduled according to the risk, so that the higher the risk level the sooner the procedure is scheduled to be executed. Care must however be taken so that all feature sets are covered by some testing, that is no feature set must be left out of the execution schedule.  |
| Test documentation and reporting  | The test projects must be documented in such a way that an audit can establish what has been planned and what has been performed. Tracing between artefacts is essential. A project test plan and a project test completion report as outlined in ISO/IEC/IEEE 29119 Part 3 must be produced at the test project level.  |
| Test automation and tools  | The test management tool BCG is to be used on all test projects and for all sub-processes. In the cases where more than 4 regression tests are planned the project might consider using a capture/playback testing tool.  |
| Configuration management of test work products  | The Traditional Ltd process for configuration management must be followed for all test work products.  |
| Incident management  | The Traditional Ltd process for incident management must be followed.  |
| Test sub-processes  | Each test project must include the following test sub-processes: - Performance test – if applicable in relation to requirements - Operability test - Component testing - Component integration testing – preferably bottom-up - System testing  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **69**

| **Organizational System Testing Strategy**  | **Organizational System Testing Strategy**  |
| --- | --- |
| **Issue**  | **Strategy**  |
| Entry and Exit criteria  | The integration test completion report and the system test specification must be approved before the system test execution might begin. All the system test deliverables must be approved before the system test is finished.  |
| Test completion criteria  | The system test is supposed to achieve 100 % requirements coverage, and all test procedures must be executed without incidents.  |
| Test documentation  | A system test plan and a system test completion report as outlined in ISO/IEC/IEEE 29119 Part 3 must be produced, as must all documents defined for dynamic testing.  |
| Degree of independence  | The system test must be specified by the staff in the test department and executed by students.  |
| Test design techniques  | Appropriate black-box test case design techniques are to be used. Error guessing could also be used, if defect information exists for previous versions.  |
| Test environment  | The system testing environment must be identical to the production environment in terms of hardware and software. In the case of embedded systems the system test could be executed on a simulator. Data could be made anonymous, but must otherwise be 100 % representative.  |
| Metrics to be collected  | The following shall be reported in the system test completion report: - Total number of specified test procedures - Total number of executed test procedures - Total number of testing hours spent on specification - Total number of hours spent on execution and registration of incidents - Total number of hours elapsed for testing - Total number of failures found  |
| Retesting and regression testing  | All test procedures resulting in incident reports must be rerun after defect correction. Regression testing during the system test sub-process is at the test manager’s discretion. In the final system test run, all test procedures must be executed.  |

© ISO/IEC 2013 – All rights reserved

**70** © IEEE 2013 – All rights reserved 

| **Organizational Component Testing Strategy**  | **Organizational Component Testing Strategy**  |
| --- | --- |
| **Issue**  | **Strategy**  |
| Entry and Exit criteria  | The test item (component) must compile and link, and the component test specification must be approved before the component test execution can begin. All the component test deliverables must be approved before the component test is finished.  |
| Test completion criteria  | The tests for each component is supposed to achieve at least 90 % statement coverage and at least 80% decision outcome coverage, and all test cases for a component must be executed without incidents. Reason for non-conformances must be reported and accepted by the project manager.  |
| Test documentation  | A component test plan and a component test completion report as outlined in ISO/IEC/IEEE 29119 Part 3 must be produced; Test cases to help ensure coverage must be produced for each component.  |
| Degree of independence  | The component test must be specified and executed as a peer test, that is, by a developer who is not the one who coded the component under test.  |
| Test design techniques  | Appropriate black box test case design techniques are to be used, and these must be supplemented by the white box techniques: statement testing, and decision outcome testing, where necessary to help ensure required coverage. |
| Test environment  | The component testing can be executed in the development environment of the developer who is designing the test, i.e. not the environment of the developer who coded the component under test.  |
| Metrics to be collected  | The following must be reported in the component test completion report: Average obtained statement coverage. Average obtained decision outcome coverage. Total number of incidents found and corrected.  |
| Retesting and regression testing  | Each component must be retested until completion criteria have been reached.  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **71**

# Annex F (informative) 

###  Test Plan 

### F.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

This plan is available on the project portal and the newest version is also posted in the top right corner of the story board in the development room. 

### Test plan for: New subscription system (NSS) Vers.: Iteration 3 

**Covers:** NSS iteration 3 result and stories, including result of previous iterations. **People:** Each iteration is carried out by the team consisting of developers, user representatives, and testers. The developers ultimately refer to the Head of Development (Ursula), and the testers to the Head of QA (Stephan). 

**Risks:** The specific risks for this iteration are listed on the story cards. The general risk is that the iteration team does not have access to live data in the supporting databases. 

**Test strategy:** Remember to: 

 Create automated tests based on stories before coding starts, test the new code, and test the integration with the current version of the system before marking a story as completed. 

 Retest every time something has been changed in the result from previous iterations as well as for this current iteration, and to regression test the entire result of this iteration before the showcase meeting. 

 Estimate and cost testing and development to fit within the allocated iteration as agreed at the iteration kick-off, and return to the backlog any items which cannot be met by the end, including any technical debt (errors) accumulated which cannot be resolved in the allocated iteration. 

 Use the test design technique(s) most appropriate to the acceptance criteria, keeping in mind that higher risk stories require more thorough testing that lower risk stories. 

 Ensure and verify that testing achieves statement coverage of at least 90%, of all code as well as branch coverage for 80% of the high risk stories and 60% of the low risk stories. 

 Ensure that no defects of severity 1 or 2 remain outstanding in the implementation of a story before it is integrated. 

 Define customer facing (acceptance) ATDD Test in the iteration with customer/user agreement and participation. 

 Before the showcase meeting, test the result of the iteration in the official test and presentation environment. 

_To be continued_ 

© ISO/IEC 2013 – All rights reserved

**72** © IEEE 2013 – All rights reserved 

 _Continued from previous page_ 

 Cover test items at daily stand up meetings, including low level test plan activities and risk documented on whiteboards. 

 Store all test scripts in the ABC tool, so that they are available for retesting and regression testing as needed. 

 Issue a short summary report of the testing at the end of each iteration, and place it in the project portal. 

 **Testing activities and estimates:** Test effort is expected to take one third of the total team effort spent during the iteration. At this point in time the showcase test is estimated to take 3 hours duration. **F.2 Example 2 – Traditional Ltd** 

This example includes two sub-examples of test plans, namely: Project Test Plan 

 System Test Plan 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **73**

**F.2.1 Project Test Plan** 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

# UV/TIT-14 33a ProjectSystem Test Plan 

#  PC-Part 

### Version 1.3 

| **ID:**  | 234 |
| --- | ---: |
| **Version:**  | 1.3  |
| **Date :**  | 11.03.2005 |
| **Author:**  | amj, cnj |
|  **Approved:** | joj  |

© ISO/IEC 2013 – All rights reserved

**74** © IEEE 2013 – All rights reserved 

### Revision log 

| **Date**  | **Version**  | **Changes**  | **Init.**  |
| ---: | ---: | --- | --- |
| 10.10.03  | 0.1  | Initial issue of document  | amj  |
| 12.10.03  | 0.2  | New test item description  | cnj  |
| 16.01.04  | 1.0  | Correct typos after review  | cnj  |
| 20.01.04  | 1.1  | New risk identification  | amj  |
| 05.02.04  | 1.2  | Minor change in structure of text  | cnj  |
| 11.03.05  | 1.3  | Update after walkthrough  | amj  |

**1 Introduction** 

**1.1 Scope** The purpose of this document is to provide the information and the framework required to plan and perform all test processes needed for the testing of the PC-part of the UV/TIT-14 33a product. 

**1.2 References** \[PP\] Project Plan 

\[PRS\] Project Requirements Specification \[OTS\] Organizational Test Strategy for Traditional Ltd \[KD\] Requirements Specification for PC part of UV/TIT-14 33a.; Vers. 1.8 \[HW/SW-spec\] Hardware and software specification 

**1.3 Glossary** The definitions specified in \[PP\] are also valid in this document. The following abbreviations are used: 

TBD To be defined 

**2 Plan context** 

**2.1 Project** The UV/TIT product consists of the following hardware modules: 

 UV spectrometer; IR Spectrometer; 

 Automatic burette; Conveyor; 

 Computer (server); PC. 

 The architecture is shown in the following figure. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **75** 

UV-spectrometer IR-spectrometer Automatic burette

Computer PC

bus network

Conveyor 

The system consists of the following software modules on the computer (the server): 

 UV module; IR module; 

 Burette module; Conveyor module; 

 Network module. 

The system consists of the following software modules on the PC: 

 Calibration module; Compound identification and concentration module; 

 Setup module; Control and report module; 

 Network module. 

**2.2 Test item(s)** The test for this project includes testing of: 

 Each module of the PC software, as listed in 2.1 above; Each component of the PC software modules listed in 2.1 above; 

 The functionality of the complete software system. 

The exact versions of the various test items must be obtained from the configuration management system at the time of specifying the test, and must be controlled prior to the execution of any test. 

**2.3 Test scope** The PC system consists of software modules listed above. The network module is bought as a standard product and tested by so many organizations that it is not considered worthwhile testing. All the other modules shall be tested under the assumption that the operating system on the PC and the network are working correctly. 

Functionality directly related to the network connection to the computer will not be tested, except indirectly when these features are used in connection with some other tests. 

Non-functional quality factors like performance, security, safety, and usability will not be tested in this test project because these tests will be outsourced to another company that will perform this part of the test. A separate Test Plan for these will be created by the outsourcing company responsible for that testing. 

© ISO/IEC 2013 – All rights reserved

**76** © IEEE 2013 – All rights reserved 

**2.4 Assumptions and constraints** 

None. 

**2.5 Stakeholders** 

Please refer to the stakeholder analysis in \[PP\]. 

### 3 Testing communication Please refer to \[PP\]. 

### 4 Risk register The following abbreviations are used in the risk tables: P = probability or likelihood of the risk 

I = Impact or effect if risk materialises E = Exposure = Probability x Impact 

 The scales for both probability and impact will be 1-6, where 6 is the highest. 

**4.1 Product risks** 

| **Risk ID**  | **P**  | **I**  | **E**  | **Mitigation Activities**  |
| --- | ---: | ---: | ---: | --- |
| **1** The calibration is not correct.  | 2  | 5  | 10  | Review of design and of code Extra thorough component test Investigate the possibility of automated test recording (checking actual results against expected – maybe get an ‘oracle’)  |
| **2** The compound identification is not correct.  | 2  | 6  | 12  | Review of design Code inspection Extra thorough component test  |
| **3** The concentration calculation is not correct.  | 1  | 6  | 6  | Review of design Code inspection Extra thorough component test  |
| **4** The calculation ‘drifts’ if the machine is not turned off now and again.  | 3  | 5  | 15  | Code inspection Dynamic analysis to identify any memory leaks Stress test by letting the machine operate for several days without turning it off  |
| **5** The compound identification is too slow.  | 3  | 1  | 3  | Performance test under various conditions  |
| **6** The reports are not correct.  | 2  | 5  | 10  | Review of design and of code Extra thorough component test Investigate the possibility of automated test recording (checking actual results against expected – maybe get an ‘oracle’)  |
| **7** A software crashes in the middle of an analysis will give unreliable results.  | 2  | 2  | 4  | Stress test by forcing the machine to crash during an analysis  |
| **8** The user manuals are not understandable for laboratory technicians.  | 4  | 3  | 12  | Usability assessment of user manuals Inspection of user manuals  |

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 77 

| **Risk ID**  | **P**  | **I**  | **E**  | **Mitigation Activities**  |
| --- | ---: | ---: | ---: | --- |
| **9** The setup is difficult to understand.  | 4  | 2  | 8  | Usability assessment of prototype of interface Extra care in requirements specification Review of requirements Review of design Extra careful component test  |
| **10** There are problems with the text in localised reports.  | 5  | 3  | 15  | Review of all reports in languages known to create longer texts  |

**4.2 Project risks** 

| **Risk ID**  | **P**  | **I**  | **E**  | **Mitigation Activities**  |
| --- | ---: | ---: | ---: | --- |
| **1** Insufficient staff available  | 2  | 4  | 8  | Be extremely careful when estimating the effort of the project. Carry out a thorough product risk analysis and plan in strict accordance with it. Follow test progress extremely closely. Report progress and resource problems clearly at every available opportunity.  |
| **2** The people who are available lack sufficient knowledge and experience  | 2  | 3  | 6  | Perform a gap analysis of needs in relation to what is available. Prepare a training plan for each individual participant. Include training time in the schedule. Find mentors, if possible. Set aside extra time for review of work carried out by people with little or no experience.  |
| **3** Some of the people who are available will not / cannot work together  | 5  | 2  | 10  | Try to identify what the problem is. Arrange for arbitration if necessary / practicable. Where necessary, arrange for a Belbin analysis to increase understanding between the various types. Distribute activities so that there is as little contact between the individuals in question as possible.  |
| **4** There are too few licenses available for test execution tools  | 3  | 2  | 6  | Attempt to convince those responsible for approving additional licenses that this is necessary. Distribute and plan activities in detail in order to reduce waiting times as far as possible. Perform meticulous progress follow ups. Report related problems at an early stage and as clearly as possible.  |
| **5** The test manager is not familiar with the tools used to support management of the test project  | 4  | 1  | 4  | Obtain funding for and plan a course if possible. Find someone from within the company who has experience of using the tool. Allocate additional time to the estimation of test management activities. Report related problems at as early a stage as possible and as clearly as possible.  |

© ISO/IEC 2013 – All rights reserved

### 78 © IEEE 2013 – All rights reserved 

| **Risk ID**  | **P**  | **I**  | **E**  | **Mitigation Activities**  |
| --- | ---: | ---: | ---: | --- |
| **6** Previous experience shows that the sub-contractor doesn’t always supply the expected material on time and to the expected quality  | 3  | 4  | 12  | State relevant contractual requirements precisely. Establish specific quality criteria for deliverables. Specify the consequences of breaches of quality and scheduled delivery. Follow progress and quality closely. Implement consequences as/when necessary.  |
| **7** We are using more than 30% of test execution time on incident reporting  | 4  | 5  | 20  | Suspend testing until unit test has been done.  |

**5 Test strategy** 

**5.1 Test sub-processes** The test for the PC-part of the UV/TIT-14 33a product shall include the following test sub-processes: Component testing; 

 Component integration testing; System Testing. 

**5.2 Test deliverables** For each test sub-processes the following documentation must be produced: Test sub-process test plan; 

 Test specification; Test log; 

###  Test sub-process completion report. 

**5.3 Test design techniques** This is specified for each test sub-process according to the appropriate part of the \[OTS\]. 

**5.4 Test completion criteria** This is specified for each test sub-process according to the appropriate part of the \[OTS\]. 

**5.5 Metrics to be collected** This is specified for each test sub-process according to the appropriate part of the \[OTS\]. 

**5.6 Test data and test environment requirements** This is specified for each test sub-process according to the appropriate part of the \[OTS\]. Specific testing tool requirements are: 

 Ant; JIRA; 

 JBoss; Test link 1.8 RC2. 

**5.7 Retesting and regression testing** This is specified for each test sub-process according to the appropriate part of the \[OTS\]. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **79** 

**5.8 Suspension and resumption criteria** 

Suspension criteria are listed in the project risk register above (see Risk 7). 

**5.9 Deviations from the organizational test strategy** See individual test sub-process test plans. 

**6 Testing activities and estimates** This information is available in the intranet tool Mpower and Organization Dashboard measures. 

https://mpower.Traditional.com/irj/portal 

For information on cost related measures and monthly tracking, refer the following link: 

https://processnet.masked.com/projectdashboard/Dashboardhome\_new.asp 

This information is only accessible by project managers and above. 

**7 Staffing** 

**7.1 Roles, activities, and responsibilities** 

The high-level activities are the sub-processes to be performed. The detailed activities and responsibilities will be documented in the test sub-process test plans. 

**7.2 Hiring needs** 

See individual test sub-process test plans. 

**7.3 Training needs** 

See individual test sub-process test plans. 

**8 Schedule** The schedule for the testing covered by this plan is included in the Gantt diagram for the project. 

 **F.2.2 System Test Plan** 

### UV/TIT–14 33a PC-Part, System Test Plan 

The front page and document specific information is not included in this example. 

**1 Introduction** See the Project Test Plan 

**2 Plan context** 

**2.1 Project** 

See the Project Test Plan. 

**2.2 Test item(s)** 

The test item is the integrated PC-software for the PC-part of UV/TIT-14. 

© ISO/IEC 2013 – All rights reserved

**80** © IEEE 2013 – All rights reserved 

**2.3 Test scope** 

The features to be tested can be subdivided into these groups. 

 Setup of the system; 

 Identification of compounds (IR+UV); 

 Concentration of compounds (UV + control of burettes); 

 Calibration of UV, IR, and burettes; 

 Reports on identification, concentrations, and calibration; 

 Reports on setup; 

 Control of conveyor system (speed, correct start and stop positions etc.); 

 Statistics. 

This test plan does not cover other test sub-processes than system testing, i.e. not for example component testing and acceptance testing. 

Features directly related to the network connection to the computer will not be tested, except indirectly when these features are used in connection with some other tests. 

Non-functional quality factors like performance, security, safety, and usability will not be tested in this test project because these tests will be outsourced to another company that will perform this part of the test. 

The test covers all the PC-software developed specifically for this system, which means that other elements like the operating system and the network are not tested explicitly. 

**2.4 Assumptions and constraints** 

See the Project Test Plan. 

**2.5 Stakeholders** 

See the Project Test Plan. 

**3 Testing communication** See the Project Test Plan. 

**4 Risk register** 

**4.1 Product Risks** 

See the Project Test Plan for product risks. 

**4.2 Project Risks** 

D = Development 

T = Test 

| **Risk ID**  | **Consequences**  | **Prevention**  | **Mitigation**  |
| --- | --- | --- | --- |
| 1 Dependency of the development.  | If the development is delayed the test will be delayed accordingly. It might be difficult to keep to the schedule.  | D: Perform a realistic re-estimation and planning. T: None  | D: Re-evaluate plans to sufficient extent, not "slice by slice". T: None  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **81**

| **Risk ID**  | **Consequences**  | **Prevention**  | **Mitigation**  |
| --- | --- | --- | --- |
| 2 It appears that we can’t automate as many test procedures as anticipated.  | More test procedures must be executed manually. It might be difficult to keep the schedule.  | D: None T: Examine if this is the case during developing of test procedures.  | D: None T: Add resources.  |
| 3 Presence of blocking faults  | Postpone some parts of the test. It might be difficult to keep the schedule.  | D: Take care of thorough module and integration test T: None  | D: Correct faults. T: None  |
| 4 Changes keep coming all the time.  | The test effort is used to update documentation rather than testing.  | D: Baseline the specifications and respect this baseline. T: None  | D: None T: None  |

**5 Test strategy** 

**5.1 Test deliverables** The test deliverables for the entire system test are: 

 this present plan in an up-to-date version at the time of delivery; a full set of test specifications; 

 a test completion report for the complete system test of the PC-Part of UV/TIT-14 33a. 

The test deliverables for each executed test procedure are: a test log signed by the test manager. The test log must include the identification numbers of the incident 

reports raised during the execution of the test, if any; an updated version of the test specification or a list of known defects in the test specification. 

**5.2 Test design techniques** The following test case design techniques are to be used where they are relevant: equivalence partitioning and boundary value analysis; 

 classification tree method; decision table testing; 

 state transition testing; use case testing. 

**5.3 Test completion criteria** The system test must achieve 80 % requirements coverage, and all test procedures must be executed without failures of severity 1 (High). 

**5.4 Metrics to be collected** The following metrics are to be collected during the course of the system test: number of executed test cases; 

 number of incidents per category; number of re-executed test cases; 

© ISO/IEC 2013 – All rights reserved

**82** © IEEE 2013 – All rights reserved 

 number of solved incidents per category; number of hours spent. 

**5.5 Test environment requirements** The tester (the person responsible for the test execution) must have the following documents available during the execution of the test: 

 \[PRS\] this test plan 

 user manual for UV/TIT-14 33a copies of the test procedures for each of the tests to be executed, for use as test log sheets 

 The hardware and the operating system and the network are all described in \[HW/SW-spec\] 

In order to conduct the tests another PC will be used as a simulator, so that the commands sent to the computer can be analyzed and simple responses can be simulated. This will reduce manual handling of many samples, but it requires the development of a simulator. So there is a need for a simulator, which runs on an ordinary PC and is identical to the system PC. 

**5.6 Retesting and regression testing** The necessary retesting and regression testing to fulfil the completion criteria must be performed. It is estimated that at least 3 testing cycles will be performed, the last one including a complete regression test. 

**5.7 Suspension and resumption criteria** If test completion is impossible due to external causes the completion must be postponed until these have been cleared. It must be evident from the test log what has happened and for how long the testing was suspended. As little as possible of the testing already done should be repeated at resumption, based on a risk assessment. 

If the completion of a test suite is impossible due to a failure, this must be reported via the incident management system, and the failure must be assigned a test severity of ‘High’. At resumption of the test the affected test procedure must be repeated. 

**5.8 Deviations from the organizational test strategy** The Organizational Test Strategy requires 100 % requirements coverage, but this has been reduced to 80 % for this system test because there are relatively few product risks and the component test is planned to be very thorough. 

**6 Testing activities and estimates** The test work will be broken down into the following main activities in accordance with \[OTS\]: 

1. Definition of an overall structure for the test in the form of feature sets to be tested; 
2. Detailed specification of the test cases and test procedures; 
3. Establishment of the test environment; 
4. First execution cycle of test procedures; 
5. Second cycle of test procedures (retest and regression test from first cycle); 
6. Third cycle of test procedures (retest and regression test from second cycle and any left over from first cycle); 
7. Status report about the test execution every week; 
8. Test completion reporting. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **83**

The detailed testing activities and their estimates can be found in SYS-TEST.xls in the project portal. 

**7 Staffing** 

**7.1 Roles, activities, and responsibilities** 

The RACI matrix below illustrates which role is involved in which activity(ies) and what the involvement is. The activity numbers refer to the activity list above 

| **Role \\ Activity**  | **1**  | **2**  | **3**  | **4**  |
| --- | --- | --- | --- | --- |
| Test lead  | A  | A  | A  | A  |
| Test analyst  | R  | R  | R  | C  |
| Test designer  | R  | R  | R  | I  |
| Test environment expert  | -  | R  | -  | I  |
| Test executor  | I  | I  | I  | R  |

**R**esponsible **A**ccountable **C**onsulted **I**nformed 

| **Resource**  | **Name**  | **Description**  |
| --- | --- | --- |
| LN  | Leila Nielsen  | Test analyst  |
| CBB  | Christina Bagge  | Test analyst / designer  |
| CD  | Carsten Dominique  | Test environment expert  |
| T1 – T2  | TBD  | Test execution  |

The roles are filled as follows: 

**7.2 Hiring needs** 

We need two students (or similar) to execute the tests. These will be hired in accordance with the HR hiring rules. 

**7.3 Training needs** 

Only an introduction to the system for the 2 test executors is needed. This is estimated to take 1 hour on their first day. 

**8 Schedule** The overall schedule for the test is shown below. 

| Test Schedule  | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  | 8  | 9  | 10  | 11  | 12  | 13  | 14  | 15  | 16  | 16  |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Analyze  |  |  |  |  |  |  |  |  |  |  |   |  |  |  |  |  |  |  |
| Design  |   |   |  |   |  |   |   |   |   |   |  |  |  |   |  |  |  |  |
| Test environ’t.  |   |   |   |  |   |   |   |  |  |   |  |  |  |   |  |  |  |  |
| Test execution (all 3 cycles)  |  |  |  |  |   |  |  |  |  |  |   |   |   |  |   |  |  |   |
| Completion report  |  |  |  |  |  |  |  |  |  |   |  |  |  |  |  |  |   |   |

© ISO/IEC 2013 – All rights reserved

**84** © IEEE 2013 – All rights reserved 

# Annex G (informative) 

###  Test Status Report 

### G.1 Example 1 – Agile Corporation 

A status report is produced at the end of each iteration in the form of a summary report placed in the project portal. 

### Summary Status Test Report for: New subscription system (NSS) Vers.: Iteration 3 

**Covers:** Complete NSS iteration 3 results. 

**Progress against Test Plan:** Test has been done in the iteration on the 5 user stories for this iteration. 

For the one high risk story 92 % statement coverage was achieved, and for the others 68 % statement coverage was achieved on average. 

There are no outstanding defects of severity 1 and 2, but the showcase showed that the product has 16 defects of severity 3. 

**Factors blocking progress:** None 

**Test measures:** 6 new test procedures have been developed, and 2 of the other test procedures have been changed. 

The testing in the iteration has taken up approx. 30 % of the time. The test took about 2½ hours. 

**New and changed risks:** The risks for the stories have been mitigated satisfactorily. New risks are not identified yet. 

**Planned testing:** As per test plan. 

**Backlog added**: 16 defects (severity 3) 

### G.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

### Project PC-part of the UV/TIT-14 33a product. 

**System Test Status Report, V 1.0, 22.03.2004** 

Test Status on 22nd March 2004 

**Reporting period:** 15 – 21 Mar 2004 

**Progress against test plan:** The functionalities of the ‘XX’ module of the application were tested. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **85**

We almost reached the target in the plan of having executed 2/3 of the test cases. We expect to catch up with the small delay next week. It appears that most of the failures founds are due to simple defects in individual modules. See details below. 

**Blocking factors:** None 

**Test measures:** NOTE The graphs do not necessarily correspond to the tables in this example; they are included to illustrate that graphs and tables could be included in a report. 

![](data:image/jpeg;base64,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)

The measures collected in the following tables were collected. P1-P6 are priorities, where P1 is highest. 

**Test Case Execution Measures – Daily** 

| **Description**  | **#**  | **%**  |
| --- | ---: | ---: |
| **Total Number of Test Cases Executed today - Actual**  | **30**  |   |
| **Number of Test Cases Passed**  | **27**  | **90%**  |
| **Number of Test Cases Failed**  | **3**  | **10%**  |

© ISO/IEC 2013 – All rights reserved

**86** © IEEE 2013 – All rights reserved 

**Test Case Execution Measures – Cumulative** 

| **Description**  | **#**  | **%**  |
| --- | ---: | ---: |
| **Total Number of Test Cases Planned**  | **151**  |  **100%**  |
| **Total Number of Test Cases Executed To Date**  | **38**  | **25.17%**  |
| **Total Number of Test Cases Passed out of executed ones**  | **34**  | **89.47%**  |
| **Total Number of Test Cases Failed out of executed ones**  | **4**  | **10.53%**  |
| **Total Number of Test Cases Pending**  | **113**  | **74.83%**  |

**Defect Summary - Daily** 

| **Description**  | **Total Number** | **P 1**  | **P 2**  | **P 3**  | **P 4**  | **P 5**  | **P 6**  |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **Total # of Defects For the Day**  | **5**  | **0**  | **0**  | **4**  | **1**  | **0**  | **0**  |
| **# of Defects New**  | **5**  | **0**  | **0**  | **4**  | **1**  | **0**  | **0**  |
| **# of Defects Retested & Closed**  | **8**  | **0**  | **0**  | **4**  | **3**  | **1**  | **0**  |
| **# of Defects Re-opened**  | **1**  | **0**  | **0**  | **0**  | **1**  | **0**  | **0**  |

**Defect Summary - Cumulative** 

| **Description**  | **Total Number**  | **P 1**  | **P 2**  | **P 3**  | **P 4**  | **P 5**  | **P 6**  |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **# of Defects To Date**  | **42**  | **0**  | **9**  | **21**  | **10**  | **2**  | **0**  |
| **# of Defects Rejected To Date**  | **1**  | **0**  | **0**  | **1**  | **0**  | **0**  | **0**  |
| **# of Defects Fixed To Date**  | **31**  | **0**  | **7**  | **16**  | **6**  | **2**  | **0**  |
| **# of Defects retested & Closed To Date**  | **32**  | **0**  | **7**  | **16**  | **7**  | **2**  | **0**  |
| **# of Defects Open\\Pending on Date**  | **10**  | **0**  | **2**  | **6**  | **2**  | **0**  | **0**  |

**New and changed risks**: None 

**Planned testing**: The team is testing and investing a lot of time in uncovering defects that were supposed to have been found during the component testing sub-process. If adequate steps could be taken by the development team in fine tuning the component test cases then the QA team would be able to save a lot of time and concentrate on other aspects of efficiently testing the application. However, the overall Test summary suggests that there are no P1 bugs. If the open P2 could be fixed by the next build then the QA team could still have time for a complete cycle of regression testing and would be able to meet the release time line. 

The cumulative test report as shown above suggests that the application did grow stable towards the 2nd cycle of testing. After the completion of the 2nd cycle it can be predicted that all the test cases of ‘XX’ module would pass. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **87**

# Annex H (informative) 

###  Test Completion Report 

### H.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in [Annex C. ](#annex-c-informative)

This report is available on the project portal and the newest version is also posted in the bottom right corner of the story board in the development room as it is developed/updated. 

### Test report for: New subscription system (NSS) Vers.: Iteration 3361 

**Covers:** NSS final iteration result, including result of previous iterations, in preparation for a major customer delivery (for use). 

**Risks:** The live data risk was retired by creation of a simulated database using historic live data “cleaned” by the test team and customer. 

**Test Results: Customer accepted this release of the product based on:** 16 user stories were successful, including one added after the last status report. 

100% statement coverage was achieved in technology-facing testing with the one high risk story, and for the others 72% statement coverage was achieved on average. 

Team accepted the backlog on 4 defects of severity 3. Showcase was accepted by the customer with no added findings. Showcase demo iteration features interfaced with “live” data. 

Performance of the iteration features was found to be acceptable by team and customer. **New, changed, and residual risks:** Security of the system could become an issue in future releases, assuming a follow work activity is received from the customer. 

**Notes for future work from retrospective**: Iteration team feels a new member could be needed given possible new risk since no one has knowledge in this area. 

Severity 3 defects that move on to backlog should be addressed in next release to reduce technical debt. The modified live data worked well and should be maintained. 

Test automation and exploratory testing is working, but additional test design techniques should be considered, e.g. security and combinatorial testing. 

© ISO/IEC 2013 – All rights reserved

**88** © IEEE 2013 – All rights reserved 

### H.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

### Project PC-part of the UV/TIT-14 33a product 

**System Test Completion Report, V 1.0, 08.11.2004** Written by Test Manager Carlo Titlefsen 

Approved by Project Manager Benedicte Rytter **Summary of testing performed:** 

 The test specification was produced; it included 600 test procedures. The test environment was established according to the plan. 

 Test execution and recording were performed according to the plan. 

**Deviations from planned testing:** The Requirement Specification was updated during the test to V5.6. This entailed rewriting of a few test cases, but this did not have an impact on the schedule. 

**Test completion evaluation:** All test procedures are executed without failures of severity 1 (High). This has not been reached, because one test procedures was not executed. The requirement this test procedure covers is, however, of such low risk exposure that the test has been accepted by the Product Owner. 

**Factors that blocked progress:** None **Test measures:** 

One (Test procedure 4.7) of the 600 planned test procedures was not executed at all because of lack of time. All the 599 test procedures that were run had passed at the end of the 3 weeks. 

During the test 83 incidents were found and 83 were solved. The reported incidents were number 107 to number 189. 

Working hours spent: 164 working hours were spent on the production of the test specification 

 10 working hours were spent on the establishment of the test environment 225 working hours were spent on test execution and recording 

 One half hour was spent on this report.  

**New, changed, and residual risks:** All the risks listed in the test plan have been eliminated, except the one with the lowest exposure, Risk no. 19. 

**Test deliverables:** All deliverables specified in the plan have been delivered to the common CM-system according to the procedure. 

**Reusable test assets:** The test specification and the related test data and test environment requirements could be reused for maintenance testing, if and when this is needed. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **89**

**Lessons learned:** The test executors should have been given a general introduction to the system; it sometimes delayed them finding out how to perform a test case, but fortunately the test analyst was available throughout the test period. 

© ISO/IEC 2013 – All rights reserved

**90** © IEEE 2013 – All rights reserved 

# Annex I (informative) 

###  Test Design Specification 

### I.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

This test design specification is available on the project portal and the newest version is also posted in the top right corner of the story board under the test plan in the development room. 

### Test design 

**We have the following themes:** 

1. Administration 
2. New and extended subscriptions 
3. General access on the web-site 
4. Complaints 

 For the showcase testing, stories should be sorted by theme. The test conditions on the back of the story cards, which describe the story acceptance criteria, should be covered. 

### Version: 1 (Ursula) 

### I.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

### Test Design Specification 

To make it easier to understand what the test specification is based on, an extract of the system requirements for the PC part of UV/TIT-14 33a is included here. 

### System Requirements Specification for PC part of UV/TIT-14 33a (extract) 

**4.1 Setup** 

4.1.1 \[22\] The system shall have a setup menu with the following menu points: 

 Conveyor setup 

 Calibration setup 

 ... setup 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **91**

**4.2 Setup of the conveyor** 

4.2.1 \[34\] The following parameters should be set _\[the numbers in brackets are the ranges that can be used\]_: 

 Max speed (mm/s) (5-50) Min speed (mm/s) for a running conveyor (it is 0 for a stopped one) (2-10) 

4.2.2 \[36\] When a new setup is committed the system shall show one of the following messages Setup done 

 Max speed out of range Min speed out of range 

4.2.3 \[37\] The system shall allow the user to leave the setup functionality without changing anything 

### . . 

### . 

**4.8 Analysis** 

4.8.1 \[324\] The system shall allow the user to set the type of concentration analysis to be performed. The types of analysis known to the system are given in table 6 below. 

4.8.2 \[325\] The system shall accept samples within the ranges given below. Results that fall outside the ranges are “Invalid”. The ranges are given in table 6 below. 

4.8.3 \[326\] The system shall display one of the following results based on the findings: “Accepted”, “Warning”, and “Alarm”. The values for the thresholds are given in table 6 below. 

**Table 6: Standard Analysis Type Table** 

| **Type**  | **Measuring range**  | **Highest accept**  | **Highest warning** | **Sample price**  |
| --- | --- | ---: | ---: | ---: |
| NCS  | 2 – 315 incl.  | 65  | 270  | 0.35 €  |
| C2O  | 0.01 – 0.89 incl.  | 0.3  | 0.65  | 0.40 €  |
| BHZ  | 0 – 9  | 4.5  | 7.5  | 0.75 €  |
| LOY  | 100 -  | 200  | 500  | 0.25 €  |

4.8.10 \[339\] The system shall ensure that the format for sample numbers as presented below is correct before a sample can be processed. 

The format for a sample number is: Sample no. = T”–“n\[n\]”-“nnn”-“dd”.”mm“.“yy 

© ISO/IEC 2013 – All rights reserved

**92** © IEEE 2013 – All rights reserved 

Where: 

T = “A” \| “S” \| “M” n = numbers from 0 – 9 

dd = numbers from 01 – 31 mm = numbers from 01 – 12 

yy = numbers from 00 – 99 

4.8.11 \[341\] The system shall accept sample numbers consisting of 4 parts divided by hyphens, namely: 

 action type (A, S, or M) 

 sample type (one or 2 digits) 

 sample id (3 digits) 

 the date the sample was taken 

Examples: A-2-344-31.08.04 M-01-255-22.12.93 

Explanation: When the sample is entered into the machine, the machine reads the number, but disregards the date. 

The way the machine is going to examine the sample depends on the action type, in that A means automatically, S means semi-automatically, and M means manually. 

The way the sample type is interpreted depends on the action type. In the case of automatic handling 1 stands for printing of a report, while 2 stands for no report. For semi-automatic handling the sample type determines how the analysis is to be performed. The sample type does not matter for manual analysis. 

In the automatic handling of the sample the analysis is performed and the result stored under the sample id. If the sample id is not found in the database the analysis will not be performed and an error message will be shown telling that the sample is not registered. The steps for an automatic analysis must, of course, be found in the database as well. 

To be able to run a semi-automatic analysis the sample type must be found in the database. The steps must also be found, and it must be indicated which steps could be skipped if the user chooses that. When the analysis is complete, a report is printed, including the performed and the skipped steps. 

For a manual analysis the user chooses each step explicitly. The user must write the report with the results as a text, which is printed when the analysis is completed. 

**4.13 Lid Operation** 

4.13.1 \[581\] One of the variants of the product shall be equipped with a lid to protect the technicians performing the analyses. 

The lid covers the carousel when it is moving. The lid has to be locked before the carousel is started and it is not possible to open it before the carousel has stopped completely. Two sensors are in place to detect if the lid is locked and if the carousel is moving. 

As long as the lid is locked it is possible to start the carousel moving either forwards or backwards. To change the direction it is necessary to stop the carousel first, but it is not necessary to open the lid. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **93**

The manoeuvring panel has the following buttons: 

‘Lock’ 

‘Open’ 

‘Forward’ 

‘Backward’ 

‘Stop’ 

**Test Design Specification for PC part of UV/TIT-14 33a.** 

Version 1.0 

### Versions 

| **Date**  | **Version**  | **Prepared by**  | **Description of change**  |
| --- | ---: | --- | --- |
| 23-05-09  | 1.0  | AMJ  | First draft  |

1\. **Introduction** 

### 1.2 Purpose 

The purpose of this part of the test specification is to provide an overview of what will be tested in the system test. 

### 1.3 Reference documents 

The following documents provide the test basis for this test design: 

| **Ref.no.**  | **Description**  | **ID**  |
| --- | --- | --- |
| \[1\]  | System requirements, test basis.  | Requirements Specification for PC part of UV/TIT-14 33a.; Vers. 1.8  |

### 1.4 Abbreviations 

| PCUV  | PC part of UV/TIT-14 33a.  |
| --- | --- |
| TC  | Test case  |
| UC  | Use case  |
| CRUD  | Create, Read, Update, Delete  |
| TBD  | To be defined, that is it is not yet known what is to be written.  |

2. **Feature Sets** 

This chapter describes the overall structure of the system test of PCUV, in that the test is divided into overall feature sets. 

The following information is provided for each feature set: 

(nn): Unique number that must never be changed. This is used for traceability purposes. ns: Section or sorting number, which could be used to facilitate the reading of the document. 

© ISO/IEC 2013 – All rights reserved

**94** © IEEE 2013 – All rights reserved 

| Description:  | A short description of what to test.  |
| --- | --- |
| Approach:  | Description of the test design techniques to be used in the design of the test.  |
| Traceability:  | Reference to the requirements in the feature set. The traceability will contain a list of unique  |

IDs referencing requirements in \[1\]. This test is divided into the following feature sets: 

    1. (FS1) Setup of the system 
    2. (FS4) Calibration of UV, IR and burettes 
    3. (FS2) Identification of compounds 
    4. (FS3) Concentration of compounds (UV + control of burettes) 
    5. (FS6) Control of conveyor system 

### Feature Set (FS1): Setup of the system 

**Objective:** To test the set-up of the system, including delivered data and reporting on calibration 

**Priority:** Above middle **Approach:** Structural testing of menus, simple requirements testing (Y/N), and 

equivalence partitioning and boundary value analysis **Traceability:** \[22\], \[34\], \[35\], \[36\], \[37\], … 

### Feature Set (FS2): Identification of compounds 

**Objective:** To test the identification and reporting of compounds 

**Priority:** High **Approach:** Simple requirements testing (Y/N), equivalence partitioning and boundary 

value analysis, syntax testing, and classification tree testing. 

**Traceability:** \[324\], \[325\], \[326\], \[339\], \[341\], …. 

### Feature Set (FS3): TBD (not completed yet) 

### Feature Set (FS4): TBD (not completed yet) 

### Feature Set (FS5): TBD (not completed yet) 

### Feature Set (FS6): Control of conveyor system 

| **Objective:**  | To test the conveyor system, incl. speed, correct start and stop positions,  |
| --- | --- |
|  | lid operation etc. |
| **Priority:**  | Below middle |
| **Approach:**  | … , state-transition testing, … |
| **Traceability:**  | \[581\], … |

3. **Test Conditions** 

In this chapter the test conditions for each feature set are documented. **.** 

### . . 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **95** 

### 3.3 Feature Set (FS2): Identification of compounds 

This feature set covers requirements related to the identification and reporting of compounds. The feature set has a number of conditions arranged in sub-sections corresponding to related requirements. 

### . . 

### . 

**3.3.7 Test Conditions for Measuring Range** 

The test conditions for measuring range can be expressed using a simple classification tree (same as equivalence partitioning) and associated boundary value analysis. All these test conditions are traceable to the same requirement, and they have the same priority. 

| **Requirement(s) covered: \[324-NCS\], \[325-NCS\]**  | **Requirement(s) covered: \[324-NCS\], \[325-NCS\]**  | **Priority: Above middle**  | **Priority: Above middle**  |
| --- | --- | --- | --- |
| **Test condition**  | **Aspect**  | **Sub-domains**  | **Comment**  |
|   | Input  |   |   |
| (FS2).5.1  |   | **\< 2**  | Out of range  |
| (FS2).5.2  |   | **2 – 315 incl.**  | Valid  |
| (FS2).5.3  |   | **\> 315**  | Out of range  |

| **Requirement(s) covered: \[324-NCS\], \[325-NCS\]**  | **Requirement(s) covered: \[324-NCS\], \[325-NCS\]**  | **Priority: Above middle**  | **Priority: Above middle**  |
| --- | --- | ---: | --- |
| **Test condition**  | **boundary type**  | **value**  | **comment**  |
| (FS2).5.1.a  | L  | unknown  | Out of range  |
| (FS2).5.1.b  | U  | 1  | Out of range  |
| (FS2).5.2.a  | L  | 2  | Valid  |
| (FS2).5.2.b  | U  | 315  | Valid  |
| (FS2).5.3.a  | L  | 316  | Out of range  |
| (FS2).5.3.b  | U  | unknown  | Out of range  |

**3.3.8 Test Conditions for Analysis Method** 

The test conditions for the identification of the analysis method from the sample number can be expressed using a classification tree. All these test conditions are traceable to the same requirement. 

© ISO/IEC 2013 – All rights reserved

**96** © IEEE 2013 – All rights reserved 

 **Prio.**  Am Am H H Am Am Am H Am H 

**domain**  **yes no**  

**aspect**  step \[n\] will be skipped 

**domain**  **yes no**  yes **no**  

**aspect**    steps in database steps in database 

**domain**  **1-print report 2-no report**  yes **no**  yes **no**  

**aspect**  sample type sample id in database sample type in database 

**Domain**  A-automatic S-semiautomatic **M-manually** 

**aspect** action 

**Requirement(s) covered: \[341\]Test condition** (FS2).8.1 (FS2).8.2 (FS2).8.3 (FS2).8.4 (FS2).8.5 (FS2).8.6 (FS2).8.7 (FS2).8.8 (FS2).8.9 (FS2).8.10

© ISO/IEC 2013 – All rights reserved  

© IEEE 2013 – All rights reserved **97**

### . . 

### . 

### 3.5 Feature Set (FS6): Control of conveyor system 

This feature set covers requirements related to the conveyor system, incl. speed, correct start and stop positions, lid operation etc. The feature set has a number of conditions arranged in sub-sections corresponding to related requirements. 

### . . 

### . 

**3.5.2 Test Conditions for Lid Operation** 

The lid operation can be illustrated in the following state-machine diagram, where the states and transitions are numbered, and the event “P” means “Press”: 

## S4

### P ‘Forward’

## Start P ‘Lock’ C movesT5 T6P ‘Stop’ T1 C stops

### Lid locks

## S1 P ‘Open’ S2

## T2 Lid opens

### P ‘Stop’ P ‘Back’

## T3 C movesT4 C stops

## S3

| **Requirement(s) covered: \[581\]**  | **Requirement(s) covered: \[581\]**  | **Priority: Above middle**  | **Priority: Above middle**  |
| --- | --- | --- | --- |
| **Test condition**  |   |   |   |
| (FS6).11.1  | The lid operation works according to the state-machine  | The lid operation works according to the state-machine  | The lid operation works according to the state-machine  |
| (FS6).11.2  | All invalid (un-shown) transitions are null-transitions  | All invalid (un-shown) transitions are null-transitions  | All invalid (un-shown) transitions are null-transitions  |

_End of example_ 

© ISO/IEC 2013 – All rights reserved

**98** © IEEE 2013 – All rights reserved 

# Annex J (informative) 

###  Test Case Specification 

### J.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

The test coverage items and test cases for a story are summarized into test case headings and noted on the back of the story card like this: 

### Confirmation: 214 

    1. The secretary can create a new subscription type 
    2. The secretary can enter name, available lengths, associated prices, and comments for a new subscription type 
    3. The secretary can store a new subscription type 
    4. The secretary can see an existing subscription type 
    5. The secretary can change the name, available lengths and associated prices for a subscription type as long as there is no subscription for it 
    6. The secretary can cancel the change of a subscription type before it is stored 
    7. The secretary can store the changes to a subscription type  

**Check: 0.**1 (Annette) 

1. The secretary story for "deletion" of subscription could be missing, so we should review with customer. Otherwise this is okay. 

### J.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

**Test Case Specification for PC part of UV/TIT-14 33a.** 

Version 1.0 

### Versions 

| **Date**  | **Version**  | **Prepared by**  | **Description of change**  |
| --- | ---: | --- | --- |
| 17-06-09  | 1.0  | AMJ  | First draft  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **99**

1\. **Introduction** 

### 1.2 Purpose 

The purpose of this part of the test specification is to list the test cases derived from the test conditions. 

### 1.3 Reference documents 

The following documents provide the test basis for this test design: 

| **Ref.no.**  | **Description**  | **ID**  |
| --- | --- | --- |
| \[1\]  | System requirements, test basis.  | Requirements Specification for PC part of UV/TIT-14 33a.; Vers. 1.8  |
| \[2\]  | Feature sets and test conditions  | Test Design Specification for PC part of UV/TIT-14 33a.; Vers. 1.0  |

### 1.4 Abbreviations 

PCUV PC part of UV/TIT-14 33a. TC Test case 

UC Use case CRUD Create, Read, Update, Delete 

TBD To be defined, that is it is not yet known what is to be written. 

2. **Test Coverage Items** 

This section describes the coverage items that can be derived from the test conditions provided in \[2\]. 

**. .** 

**.** 

### 2.3 Feature Set (FS2): Identification of compounds 

This feature set covers requirements related to the identification and reporting of compounds. The feature set has a number of coverage items derived from the test conditions; these are arranged in sub-sections corresponding to related requirements. 

**. .** 

**.**  

**2.3.7 Coverage Items for Measuring Range** There are three valid equivalence partitions and six valid boundaries (of which two are unknown: one below 0 and one greater than 315). 

The coverage items can be reduced to be the test conditions: (FS2).5.2, (FS2).5.1.b, (FS2).5.2.a, (FS2).5.2.b, (FS2).5.3.a, 

found in section 3.3.7 in \[2\]. 

© ISO/IEC 2013 – All rights reserved

**100** © IEEE 2013 – All rights reserved 

**2.3.8 Coverage Items for Analysis Method** 

The coverage items are the leaves in the classification tree in section 3.3.8 in \[2\], i.e. the sub-domains written in bold. 

There are 10 valid leaves (coverage items). 

### . . 

### . 

### 2.5 Feature Set (FS6): Control of conveyor system 

### . . 

### . 

**2.5.2 Coverage Items for Lid Operation** 

To get Chow’s 0-switch coverage of the state-machine in (FS6).11.1 in \[2\] there are the following 6 transitions (coverage items): 

|   | **CI1**  | **CI2**  | **CI3**  | **CI4**  | **CI5**  | **CI6**  |
| --- | --- | --- | --- | --- | --- | --- |
| **SS (TC)**  | S1  | S2  | S4  | S2  | S3  | S2  |
| **Input**  | P ‘L’  | P ‘F’  | P ‘S’  | P ‘B’  | P ‘S’  | P ‘O’  |
| **Exp. output**  | L l  | C m f  | C s  | C m b  | C s  | L o  |
| **ES (TC)**  | S2  | S4  | S2  | S3  | S2  | S1  |

The null-transitions are identified in this table, shown in bold italic. 

|   | **P ‘L’**  | **P ‘F’**  | **P ‘S’**  | **P ‘B’**  | **P ‘O’**  |
| --- | --- | --- | --- | --- | --- |
| **S1**  | S2/ L l  | ***S1/N***  | ***S1/N***  | ***S1/N***  | ***S1/N***  |
| **S2**  | ***S2/N***  | S4/C m f  | ***S2/N***  | S3/C m b  | S1/L o  |
| **S3**  | ***S3/N***  | ***S3/N***  | S/C s  |  |  |
| **S4**  | ***S4/N***  | ***S4/N***  | S/C s  |  |  |

There are 14 null-transitions (coverage items). 

### . . 

### . 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **101**

3. **Test Cases** 

This section describes the test cases derived from the test coverage items listed above. 

### 3.3 Feature Set (FS2): Identification of compounds 

### . . 

### . 

**3.3.7 Measuring Range** 

| **Test Case ID: 17–1 Purpose:** to test the reaction to a sample value that is out of **Priority: Am** range Tracing: (FS2).5.1.b  | **Test Case ID: 17–1 Purpose:** to test the reaction to a sample value that is out of **Priority: Am** range Tracing: (FS2).5.1.b  |
| --- | --- |
| **Preconditions:**  | The apparatus must be ready for sampling analysis. An NCS sample that has a value of 1 must be prepared.  |
| **Input:**  | Insert the sample and start the analysis.  |
| **Expected result:**  | The display shows “Invalid sample”.  |

### . . 

### . 

| **Test Case ID: 17–4 Purpose:** to test the reaction to a sample value that is on the **Priority: Am** upper boundary of a valid sample. Tracing: (FS2).5.2.b  | **Test Case ID: 17–4 Purpose:** to test the reaction to a sample value that is on the **Priority: Am** upper boundary of a valid sample. Tracing: (FS2).5.2.b  |
| --- | --- |
| **Preconditions:**  | The apparatus must be ready for sampling analysis. An NCS sample that has a value of 315 must be prepared.  |
| **Input:**  | Insert the sample and start the analysis.  |
| **Expected result:**  | The display shows “Warning”.  |

### . . 

### . 

**3.3.8 Analysis Method** 

### . . 

### . 

| **Test Case ID: 21–3 Purpose:** to test an automatic analysis of type 1. **Priority: Am** Tracing: (FS2).8.1  | **Test Case ID: 21–3 Purpose:** to test an automatic analysis of type 1. **Priority: Am** Tracing: (FS2).8.1  |
| --- | --- |
| **Preconditions:**  | The database must include: A sample type “1” with appropriate steps; A sample id of “314”. The form where the sample id is entered must be current.  |
| **Input:**  | Enter a sample with sample id: A-1-314-221204  |

© ISO/IEC 2013 – All rights reserved

**102** © IEEE 2013 – All rights reserved 

| **Expected result:**  | The analysis is performed without any required interaction. A report is printed The steps associated with sample type “1” are executed (check in the report).  |
| --- | --- |

###  . 

### . . 

| **Test Case ID: 21–16 Purpose:** to test a manual analysis. **Priority: Am** Tracing: (FS2).8.1  | **Test Case ID: 21–16 Purpose:** to test a manual analysis. **Priority: Am** Tracing: (FS2).8.1  |
| --- | --- |
| **Preconditions:**  | The form where the sample id is entered must be current.  |
| **Input:**  | Enter a sample with sample id: M-2-518-240604  |
| **Expected result:**  | The user must enter each step as the analysis progresses. The user is requested to write the report. The report is printed The report reflects the steps that have been executed.  |

3. **5 Feature Set (FS6): Control of conveyor system** 

### . . 

_End of Example_  

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **103** 

# Annex K (informative) 

###  Test Procedure Specification 

**K.1.1 Example 1.1 – Agile Corporation** 

The following was agreed with Agile Corp’s customer and team. The team also has the option of producing documentation online with the same information. It is lightweight, covering Test Spec, Test Case, Test Procedure and first level of Test actual results. 

![](data:image/jpeg;base64,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)

**Exploratory Session Charter (agile corp)**

![](data:image/jpeg;base64,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)

**Name of Test:**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7Lo/GiigAooooAKKKKAD8aKKKAEzR+NLRRoAmPej8aWjFACfjR+NLgelGB6UAJ+NFLgelGB6UAJgdqXFGKKVgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgExRiloosAmKMUtFFgEIPWucIP/CennrbL/Jq6SucP/I+/9uw/k1KVtCovc6LJoyaWiq0IEyaMmloo0ATJoJIpaDRZAZmqDF/pXJ/4+j/6KetOs3Vv+QjpP/Xy3/op60qlLcphRRRVCCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACucP/I+/wDbsP5NXR1zh/5H3/t2H8mqJdPUqPU6OiiirJCiiigApDS0hoQMztW/5CGk/wDXy3/op60qzdW/5CGk/wDXy3/op60qSDoFFFFMAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArnD/wAj7/27D+TUUVEunqVHqdHRRRVkhRRRQAUhoooQMztW/wCQhpP/AF8t/wCinrSoopIOgUUUUwP/2Q==)

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArnD/wAj7/27D+TV0dc3PFdt4vmntFgdordAVkcr97d3APpUS6FR6nSUVm+Zrn/Ppp3/AIEv/wDEUebrn/Ppp3/gS/8A8RVXJsaVFZvma5/z6ad/4Ev/APEUebrn/Ppp3/gS/wD8RRcLGlQazfN1z/n007/wJf8A+Io8zXP+fXTv/Al//iKLhYNW/wCQjpP/AF8t/wCipK0qx2h1S4v7OS4hs44oJS5KTMxOUZehUf3q2KENhRRRTEFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAIay7YD/hJL/wD64w/+z1qGsy1/5GO//wCuMP8A7PUPoNdTUwKMUUVYgxRiiigAxRRRQAYGc0UUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFACGsy1/wCRjv8A/rjD/wCz0UVD6DXU1KKKKsQUUUUAFFFFABRRRQAUUUUAf//Z)

- **Who is testing (test team)**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

- **What to Test:** **Looking for:** – **Risk (s):** **1.**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

– **Story (s)** **2.**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

– **Bug (s)** **3.** 

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

- **Support items needed:**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

- **Role (Who are you playing during the test):**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAjAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etM1mWv/ACMd/wD9cYf/AGeofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ6KKh9BrqalFFFWIKKKKACiiigAooooAKKKKAP/Z)

- **Actions:**

![](data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD/2wBDAAUDBAQEAwUEBAQFBQUGBwwIBwcHBw8KCwkMEQ8SEhEPERATFhwXExQaFRARGCEYGhwdHx8fExciJCIeJBweHx7/2wBDAQUFBQcGBw4ICA4eFBEUHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh4eHh7/wAARCAAaAmQDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD7LooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8AIx3/AP1xh/8AZ60zWZa/8jHf/wDXGH/2eofQa6mpRRRViCiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigBDWZa/8jHf/wDXGH/2etSsy0/5GPUP+uMP83qRo06KKKoQUUUUAFFFFABRRRQAUUUUAf/Z)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4XmN4+fHHBgAJHAODuj3qngAAAABJRU5ErkJggg==)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEklEQVR4XmPYe+Xl2k1nn24CABw/Bj69/qccAAAAAElFTkSuQmCC)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4XmMoXnbxnFXTgZcAFe4FHsDixsEAAAAASUVORK5CYII=)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAEUlEQVR4XmMwqtm9O3rq8T0AEnsEmDpw1AYAAAAASUVORK5CYII=)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAABCAYAAAAb4BS0AAAAFklEQVR4XmNwaD3whj1u9f8Fh+7/AgAr1Qe8OgGAoAAAAABJRU5ErkJggg==)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAMAAAABCAYAAAAb4BS0AAAAFUlEQVR4XmOwb9m/ij129X6t8p2rACTGBf++sKDJAAAAAElFTkSuQmCC)

![](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAABCAYAAAD5PA/NAAAAGUlEQVR4XmPIXXTOXiBjvYNJw26H2ClnzAE85QcnBeZkJgAAAABJRU5ErkJggg==)

 **K.1.2 Example 1.2 – Agile Corporation** 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in [Annex C. ](#annex-c-informative)

This example shows more documentation (semi-agile). 

**Test Procedure:** Secretary’s Creation of New Subscription type 

**Objective (ref spec):** Confirmation 214 

**Priority:** Low 

**Start up:** Secretary is logged on and positioned on the subscription maintenance page. 

| **Test Case Name**  | **Actual Results**  | **Test Result**  |
| --- | --- | --- |
| Create new subscription  |   |   |
| Enter info for subscription.  |   |   |
| Store the new subscription  |   |   |

**Relationships**: It is expected that test procedures for allowing the secretary access to the system etc. have been executed successfully. 

© ISO/IEC 2013 – All rights reserved

**104** © IEEE 2013 – All rights reserved 

**Stop and wrap up:** Reset the database to the ‘ready to test’ state on the QA environment. 

NOTE The above test procedure information could be contained in comments in an automated test script or information associated with exploratory testing based on the team’s decisions at the time of test implementation. 

### K.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

### Test procedure specification 

2. **Test Sets** 

This section describes the test sets to be executed in the first execution cycle. The sets are ordered by feature set. 

**2.1 (FS1) Setup of the system** 

### . . 

### . 

**2.3 (FS2) Identification of compounds** 

| **ID**  | **Objective**  | **Pri.**  | **Contents**  |
| --- | --- | --- | --- |
| I-3  | Measuring range  | Am  | Test cases 17-1 to 17-5 incl.  |
|   | …  |   |   |
|   |   |   |   |
|   |   |   |   |
|   |   |   |   |
|   |   |   |   |

###  . 

### . . 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **105** 

### 3.3 Test procedures 

| **Test Procedure ID**  | **Test Procedure ID**  | **Objective and Priority**  | **Objective and Priority**  | **Objective and Priority**  | **Objective and Priority**  | **Estimated Duration:**  |
| --- | --- | --- | --- | --- | --- | --- |
| I-3  | I-3  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  |   |
| **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  |
| **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  |
| **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  |
| Date:  | Date:  | Initials:  | Initials:  | Test item:  | Test item:  | Ok / Not OK  |
|   |   |   |   |   |   |   |
| **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  |
| **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  |
| **Step no. Test case**  | **Activities**  | **Activities**  | **Examination of result**  | **Examination of result**  | **Actual results**  | **Test Result**  |
| 1 17-1  | Start the sampling analysis. Wait for the first sample to be analysed.  | Start the sampling analysis. Wait for the first sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  Check that the display shows “Invalid sample”.  |   |   |
| 2 17-2  | Wait for the second sample to be analysed.  | Wait for the second sample to be analysed.  |  Check that the sample is analysed.  |  Check that the sample is analysed.  |   |   |
| 3 17-3  | Wait for the third sample to be analysed.  | Wait for the third sample to be analysed.  |  Check that the sample is analysed.  |  Check that the sample is analysed.  |   |   |
| 4 17-4  | Wait for the fourth sample to be analysed.  | Wait for the fourth sample to be analysed.  |  Check that the sample is analysed.  |  Check that the sample is analysed.  |   |   |
| 5 17-5  | Wait for the fifth sample to be analysed.  | Wait for the fifth sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  Check that the display shows “Invalid sample”.  |   |   |
| **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  |

© ISO/IEC 2013 – All rights reserved

**106** © IEEE 2013 – All rights reserved 

# Annex L (informative) 

###  Test Data Requirements 

### L.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

### Test Data: 

A modified set of live data needs to be populated, but data must not include critical customer data of: credit card, address, or phone number. This data will be “cleaned” by the test team and customer on project start up. Tests will be performed on the data used during the iterations. 

### L.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

**Test Data Requirements for PC part of UV/TIT-14 33a.** 

### . . 

### . 

### 1.3 Reference documents 

The following documents provide the test basis for this test design, and hence the data requirements: 

| **Ref.no.**  | **Description**  | **ID**  |
| --- | --- | --- |
| \[URS\]  | User Requirements Specification  | **…**  |

### 1.4 Abbreviations 

| PCUV  | PC part of UV/TIT-14 33a.  |
| --- | --- |
| NA  | Not applicable  |
| A/D  | Archived or Deleted  |
| TBD  | To be defined, that is it is not yet known what is to be written.  |

2. **Detailed Test Data Requirements** 

Note that all data is needed for the entire system testing period, refer to \[PTP\]. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **107**

| **ID**  | **Description**  | **Responsible**  | **Resetting**  | **A/D**  |
| --- | --- | --- | --- | --- |
| DBR1  | Full migration of the production database with anonymous personal info.  | IT-department  | Yes  | A  |
| **…**  |   |  |   |   |
| **…**  |   |  |   |   |
| DBRn  | Sample type “1” with appropriate steps  | IT-department  | NA  | A  |
| DBRn+1  | Sample id: “314”  | IT-department  | NA  | A  |
| **…**  |   |  |   |   |

Resetting means that the IT department has to be able to restore the original database on request. 

© ISO/IEC 2013 – All rights reserved

**108** © IEEE 2013 – All rights reserved 

# Annex M (informative) 

###  Test Environment Requirements 

### M.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

### Test Environment: 

The test environment is an IBM compatible PC environment, with logon signature/password and “modified live” test data available on the test system configuration. Configuration testing on this environment is not planned, but functional and performance testing will be carried out on it. 

### M.2 Example – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

### Test Environment Requirements 

**Date of issue and status** 

| **Version**  | **Date**  | **Author(s)**  | **Reviewer(s)**  | **Status**  |
| ---: | --- | --- | --- | --- |
| 1.0  | 12 Feb 2008  | Traditional Test Team  | Traditional Test Lead, Traditional Test Manager, Traditional Security Manager, Traditional Test Administrator  | Draft  |

1. **Hardware** 

Three MS Windows machines are needed for the testing. The test administrator is responsible for acquiring and configuring the machines. The machines are needed by March 15, 2008 and they will be used for two weeks. 

2. **Software** 

The three MS Windows machines need to be loaded with the MS Windows XP operating system. All patches and service packs for the machines need to be up to date. The test administrator is responsible for acquiring and installing the software. The fully loaded software for each machine needs to be ready by March 15, 2008. 

3. **Security** 

Security controls are identified in the Corporation Security Protocol. The Security Manager and the Head of Testing are responsible for security controls. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **109**

4. **Tools** 

Refer to the Test Plan for relevant testing tools. 

© ISO/IEC 2013 – All rights reserved

### 110 © IEEE 2013 – All rights reserved 

# Annex N (informative) 

###  Test Data Readiness Report 

### N.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

Status board posting: The data has been reported ready at a scrum meeting. 

### N.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

### Test Data Readiness Report 

**Summary:** The test data is not ready. The data migration to the test environment will be complete by March 22, 2008. 

**Test data status:** The following table displays the status of each test data requirement. 

| **Requirement**  | **Status**  | **Comments**  |
| --- | --- | --- |
| DBR1  | Delayed  | Due to database maintenance, the data migration to the test environment will be complete by March 22 , 2008.  |
| **…**  |   |   |
| **…**  |   |   |
| DBRn  | Ready  |  |
| DBRn+1  | Ready  |   |
| **…**  |   |   |

**Limitations:** Upon the completion of testing, the test database will be refreshed. The database is staged specifically for this test and after testing the data will contain constraints and possess system states that require the refresh. 

**Conclusions and recommendations:** The test data is not ready. As stated previously, the data will be ready by March 22, 2008. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **111**

# Annex O (informative) 

###  Test Environment Readiness Report 

### O.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in[ Annex C. ](#annex-c-informative)

Status board posting: The environment has been reported ready at a scrum meeting. No tangible test environment readiness report has been issued. 

### O.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pr](#annex-c-informative)oduces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

### Test Environment Readiness Report 

**Summary:** The test hardware and software configurations are ready for testing. The Security Manager has initially approved the test environment and will conduct another review once the data migration is complete. The test tools indicated in the Test Plan are ready for the start of testing. 

**Test environment status:** The following table displays the status of each test environment requirement. 

| **Requirement**  | **Status**  | **Comments**  |
| --- | --- | --- |
| Hardware  | Ready  | None  |
| Software  | Ready  | None  |
| Tools  | Ready  | None  |
| Security  | Ready  | The Security Manager will conduct another review once the data migration is complete.  |

© ISO/IEC 2013 – All rights reserved

**112** © IEEE 2013 – All rights reserved 

# Annex P (informative) 

###  Actual Results 

### P.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in [Annex C. ](#annex-c-informative)

### Actual Results: 

The development team, management, and local customer reps have agreed in the system demonstration that this revision of the product is good for production delivery (10 thumbs up). Further, it has been agreed that no risks or backlogs remain that cannot be addressed in the next delivery. A delivery statement to this effect from the Agile Corporation to the customer with the code and required products will be sent via electronic delivery (email). 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **113**

### P.2 Example 2 – Traditional 

**Traditional Ltd** is a small compan[y that prod](#annex-c-informative)uces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. T](#annex-c-informative)he registration of the actual results is done directly in the test procedure form. The registration is shown in ***italics*** here. 

| **Test Procedure ID**  | **Test Procedure ID**  | **Objective and Priority**  | **Objective and Priority**  | **Objective and Priority**  | **Estimated Duration:**  | **Estimated Duration:**  |
| --- | --- | --- | --- | --- | --- | --- |
| I-3  | I-3  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  |   |   |
| **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  |
| **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  |
| **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  |
| Date:  | Date:  | Initials:  | Test item:  | Test item:  | Ok / Not OK  | Ok / Not OK  |
| ***29 April 2011***  | ***29 April 2011***  | ***AMJ***  | ***Component MSR-ub V.2.3***  | ***Component MSR-ub V.2.3***  |   |   |
| **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  |
| **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  | **Procedure**  |
| **Step no. Test case**  | **Activities**  | **Activities**  | **Examination of result**  | **Actual results**  | **Actual results**  | **Test result**  |
| 1 17-1  | Start the sampling analysis. Wait for the first sample to be analysed.  | Start the sampling analysis. Wait for the first sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  _Displays “Invalid sample”_  |  _Displays “Invalid sample”_  |  ***OK***  |
| 2 17-2  | Wait for the second sample to be analysed.  | Wait for the second sample to be analysed.  |  Check that the sample is analysed.  |  _Sample is analysed_  |  _Sample is analysed_  |  ***OK***  |
| 3 17-3  | Wait for the third sample to be analysed.  | Wait for the third sample to be analysed.  |  Check that the sample is analysed.  |  _Sample is analysed_  |  _Sample is analysed_  |  ***OK***  |
| 4 17-4  | Wait for the fourth sample to be analysed.  | Wait for the fourth sample to be analysed.  |  Check that the sample is analysed.  |  _Sample is analysed_  |  _Sample is analysed_  |  ***OK***  |
| 5 17-5  | Wait for the fifth sample to be analysed.  | Wait for the fifth sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  _Displays “Invalid sample”_  |  _Displays “Invalid sample”_  |  ***OK***  |
| **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  |

© ISO/IEC 2013 – All rights reserved

**114** © IEEE 2013 – All rights reserved 

# Annex Q (informative) 

###  Test Result 

### Q.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in [Annex C.](#annex-c-informative) 

The following are the specific test results of customer facing tests. The actual captured results and data can be viewed on the project web page (www.xxx.test.agiffie.org). 

Test 1: Passed 

Test 2: Passed 

Test 3: Passed 

Test 4: Passed 

Test 5: Passed 

Test 6: Passed 

Test 7: Passed but 4 level 3 issues noted 

Tests 8-16: Passed (automated runs with regression to past iterations) 

NOTE This information could be presented in many different formats, e.g. reports, slide presentations, or verbally. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **115**

### Q.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small compa[ny that pro](#annex-c-informative)duces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

The registration of the test result is also done directly in the test procedure form. The registration is shown in ***italic*** here. 

| **Test Procedure ID**  | **Test Procedure ID**  | **Objective and Priority**  | **Objective and Priority**  | **Objective and Priority**  | **Estimated Duration:**  | **Estimated Duration:**  |
| --- | --- | --- | --- | --- | --- | --- |
| I-3  | I-3  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  | The purpose of this test procedure is to test the way the system handles the defined measuring ranges for NCS. Priority: Am  |   |   |
| **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  | **Start up:** Set the apparatus ready for sampling analysis. Place NCS samples with the following values in the carrousel: 1) Value of 1 2) Value of 2 3) Value of 56 4) Value of 315 5) Value of 316  |
| **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  | **Relationships to other procedures:** None  |
| **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  | **Test Log**  |
| Date:  | Date:  | Initials:  | Test item:  | Test item:  | Ok / Not OK  | Ok / Not OK  |
| ***29 April 2011***  | ***29 April 2011***  | ***AMJ***  | ***Component MSR-ub V.2.3***  | ***Component MSR-ub V.2.3***  |   |   |
| **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  | **Comments:**  |
|  **Procedure**  |  **Procedure**  |  **Procedure**  |  **Procedure**  |  **Procedure**  |  **Procedure**  |  **Procedure**  |
| **Step no. Test case**  | **Activities**  | **Activities**  | **Examination of result**  | **Outcome (actual results)**  | **Outcome (actual results)**  | **Test Result**  |
| 1 17-1  | Start the sampling analysis. Wait for the first sample to be analysed.  | Start the sampling analysis. Wait for the first sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  Displays “Invalid sample”  |  Displays “Invalid sample”  |  ***IR-472***  |
| 2 17-2  | Wait for the second sample to be analysed.  | Wait for the second sample to be analysed.  |  Check that the sample is analysed.  |  Sample is analysed  |  Sample is analysed  |    |
| 3 17-3  | Wait for the third sample to be analysed.  | Wait for the third sample to be analysed.  |  Check that the sample is analysed.  |  Sample is analysed  |  Sample is analysed  |   |
| 4 17-4  | Wait for the fourth sample to be analysed.  | Wait for the fourth sample to be analysed.  |  Check that the sample is analysed.  |  Sample is analysed  |  Sample is analysed  |    |
| 5 17-5  | Wait for the fifth sample to be analysed.  | Wait for the fifth sample to be analysed.  |  Check that the display shows “Invalid sample”.  |  _Displays “Invalid sample”_  |  _Displays “Invalid sample”_  |  ***IR-472***  |
| **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  | **Stop and wrap up:** Turn off the apparatus, remove the samples, and clean up any spillage.  |

© ISO/IEC 2013 – All rights reserved

**116** © IEEE 2013 – All rights reserved 

# Annex R (informative) 

###  Test Execution Log 

### R.1 Example 1 – Agile Corporation 

Agile Corporat[ion is a lar](#annex-c-informative)ge publication organization producing magazines and books. See more details in the introduction in [Annex C. ](#annex-c-informative)

An agreement was made between the Agile Corp. and the customer that the test execution log was not required to be produced. 

### R.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in [Annex C. ](#annex-c-informative)

This is an extract of the execution log for the system test of the PC-part of UV/TIT-14 33a. 

![](data:image/png;base64,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)

Note that there are the following deviations from the Test Execution Log defined in Clause 7.11: unique identifier is identical to the date; 

 the “Time” is called “Date” and is only registered as the date; the “Description” is called “Log entry”; 

 there is no “Impact” column. 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **117**

# Annex S (informative) 

###  Incident Report 

### S.1 Example 1 – Agile Corporation 

Agile Corporation is a large publication organization producing magazines and books. See more details in the introduction in [Annex C. ](#annex-c-informative)

This is the template for an incident report used in Agile Corporation. It is preferred that all incidents are addressed as soon as the team encounters them, so this form is used only as a last resort, but it is available. 

Note that it only covers the recognition (or created) status and that it has not been filled in with actual incident information. Further, this report is only used for customer facing tests where there was customer involvement. It is not used for dry runs or technology facing testing done by developers where the iteration team fixes items internally. 

| **Incident Registration Form**  | **Incident Registration Form**  | **Incident Registration Form**  | **Incident Registration Form**  |
| --- | --- | --- | --- |
| Number  |  Sprint 10 – group z - 31  |  Sprint 10 – group z - 31  |  Sprint 10 – group z - 31  |
| Short Title  |  Measured ranges for NCS out of range  |  Measured ranges for NCS out of range  |  Measured ranges for NCS out of range  |
| Software product  |  Prototype A  |  Prototype A  |  Prototype A  |
| **Status = Created**  | **Status = Created**  | **Status = Created**  | **Status = Created**  |
| Registration created by  | Jon H  | Date & time  | 1/11/11 &13:00  |
| Comprehensive description  | _NSC parameter Zstl exceeded lower bound during test 1 and a warning messagewas detected. Backlog (tech deficient) of change needed because issue associatedwith hardware-software interaction. See attachment for details on repeating._  | _NSC parameter Zstl exceeded lower bound during test 1 and a warning messagewas detected. Backlog (tech deficient) of change needed because issue associatedwith hardware-software interaction. See attachment for details on repeating._  | _NSC parameter Zstl exceeded lower bound during test 1 and a warning messagewas detected. Backlog (tech deficient) of change needed because issue associatedwith hardware-software interaction. See attachment for details on repeating._  |

© ISO/IEC 2013 – All rights reserved

**118** © IEEE 2013 – All rights reserved 

### S.2 Example 2 – Traditional Ltd 

**Traditional Ltd** is a small company that produces advanced analysis equipment to the farming industry. See more details in the introduction in[ Annex C. ](#annex-c-informative)

This is an incident report used in Traditional Ltd It only covers the recognition (or created) status, and that it has not been filled in with actual incident information. 

| **Incident Registration Form**  | **Incident Registration Form**  | **Incident Registration Form**  | **Incident Registration Form**  |
| --- | --- | --- | --- |
| Number  | 278  | 278  | 278  |
| Short Title  |  Information truncated  |  Information truncated  |  Information truncated  |
| Software product  |  Project PC-part of the UV/TIT-14 33a product  |  Project PC-part of the UV/TIT-14 33a product  |  Project PC-part of the UV/TIT-14 33a product  |
| Version (n.m)  |  5.2  |  5.2  |  5.2  |
| **Status = Created**  | **Status = Created**  | **Status = Created**  | **Status = Created**  |
| Registration created by  |  Heather Small  | Date & time  | 14th May  |
| Anomaly observed by  |  Heather Small  | Date & time  |  14th May  |
| Comprehensive description  | _The text in field “Summary” is truncated after 54 characters; itshould be able to show 75 characters._  | _The text in field “Summary” is truncated after 54 characters; itshould be able to show 75 characters._  | _The text in field “Summary” is truncated after 54 characters; itshould be able to show 75 characters._  |
| Observed during  | ~~Walk-through / Review / Inspection / Code & Build / Test / Use~~  | ~~Walk-through / Review / Inspection / Code & Build / Test / Use~~  | ~~Walk-through / Review / Inspection / Code & Build / Test / Use~~  |
| Observed during  |  |  | ~~Walk-through / Review / Inspection / Code & Build / Test / Use~~  |
| Observed in  | ~~Requirement / Design / Implementation / Test / Operation~~  | ~~Requirement / Design / Implementation / Test / Operation~~  | ~~Requirement / Design / Implementation / Test / Operation~~  |
| Observed in  |  | ~~Requirement / Design / Implementation / Test / Operation~~  | ~~Requirement / Design / Implementation / Test / Operation~~  |
| Symptom  | ~~Oper. system crash / Program hang-up / Program crash / Input /~~  | ~~Oper. system crash / Program hang-up / Program crash / Input /~~  | ~~Oper. system crash / Program hang-up / Program crash / Input /~~  |
| Symptom  | ~~Output / Total product failure / System error / Other:~~   | ~~Output / Total product failure / System error / Other:~~   | ~~Output / Total product failure / System error / Other:~~   |
| User impact  | ~~High /~~ Medium ~~/ Low~~  | ~~High /~~ Medium ~~/ Low~~  | ~~High /~~ Medium ~~/ Low~~  |
| User impact  | ~~High /~~ Medium ~~/ Low~~  | ~~High /~~ Medium ~~/ Low~~  | ~~High /~~ Medium ~~/ Low~~  |
| User urgency  | ~~Urgent / High / Medium / Low / None~~  | ~~Urgent / High / Medium / Low / None~~  | ~~Urgent / High / Medium / Low / None~~  |
| User urgency  |  | ~~Urgent / High / Medium / Low / None~~  | ~~Urgent / High / Medium / Low / None~~  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **119**

# Annex T (informative) 

##  Mappings to Existing Standards 

### T.1 Mapping to IEEE 829:2008 

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| **Master Test Plan**  | **Test Plan (Project Test Plan)**  |
| 8.1 (MTP Section 1) Introduction 8.1.1 (MTP Section 1.1) Document identifier 8.1.2 (MTP Section 1.2) Scope 8.1.3 (MTP Section 1.3) References 8.1.4 (MTP Section 1.4) System overview and key features 8.1.5 (MTP Section 1.5) Test overview 8.1.5.1 (MTP Section 1.5.1) Organization 8.1.5.2 (MTP Section 1.5.2) Master test schedule 8.1.5.3 (MTP Section 1.5.3) Integrity level scheme 8.1.5.4 (MTP Section 1.5.4) Resources summary 8.1.5.5 (MTP Section 1.5.5) Responsibilities 8.1.5.6 (MTP Section 1.5.6) Tools, techniques, methods, and metrics  |  6.2.1.1 Unique identification of document 6.2.2.1 Scope 6.2.2.2 References 6.2.3.1 Project Test organization structure (in the Test Policy) 6.2.9 Schedule Not applicable – this standard is not considering different integrity levels 6.2.8.1 Roles, activities, and responsibilities 6.2.8.1 Roles, activities, and responsibilities 6.2.6.3 Test design techniques 6.2.6.6 Test environment requirements 5.3.4.7 Metrics to be collected (in the Organizational Test Strategy)  |
| 8.2 (MTP Section 2) Details of the Master Test Plan 8.2.1 (MTP Section 2.1) Test processes including definition of test levels 8.2.2 (MTP Section 2.2) Test documentation requirements 8.2.3 (MTP Section 2.3) Test administration requirements 8.2.3.1 (MTP Section 2.3.1) Anomaly resolution and reporting 8.2.3.2 (MTP Section 2.3.2) Task iteration policy 8.2.3.3 (MTP Section 2.3.3) Deviation policy 8.2.3.4 (MTP Section 2.3.4) Control procedures 8.2.3.5 (MTP Section 2.3.5) Standards, practices, and conventions 8.2.4 (MTP Section 2.4) Test reporting requirements  |  5.2.3.2 Test process (in the Test Policy) 6.2.6.8 Test deliverables 5.3.3.6 Incident management (in the Organizational Test Strategy) 5.3.4.8 Retesting and regression testing (in the Organizational Test Strategy) Not included 5.2.3.9 Test asset archiving and reuse (in the Test Policy) 5.2.3.6 Standards (in the Test Policy) 5.2.3.7 Other relevant policies (in the Test Policy) 5.3.3.3 Test documentation and reporting (in the Organizational Test Strategy)  |
| 8.3 (MTP Section 3) General 8.3.1 (MTP section 3.1) Glossary 8.3.2 (MTP section 3.2) Document change procedures and  |  6.2.2.3 Glossary  |

© ISO/IEC 2013 – All rights reserved

### 120 © IEEE 2013 – All rights reserved 

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| history  | 6.2.1.4 Change history  |
| **Level Test Plan**  | **Test Plan (Sub-process Test Plan)**  |
| 9.1 (LTP Section 1) Introduction 9.1.1 (LTP Section 1.1) Document identifier 9.1.2 (LTP Section 1.2) Scope 9.1.3 (LTP Section 1.3) References 9.1.4 (LTP Section 1.4) Level in the overall sequence 9.1.5 (LTP Section 1.5) Test classes and overall test conditions  |  6.2.1.1 Unique identification of document 6.2.2.1 Scope 6.2.2.2 References 6.2.2.1 Scope Not included  |
| 9.2 (LTP Section 2) Details for this level of test plan 9.2.1 (LTP Section 2.1) Test items and their identifiers 9.2.2 (LTP Section 2.2) Test Traceability Matrix 9.2.3 (LTP Section 2.3) Features to be tested 9.2.4 (LTP Section 2.4) Features not to be tested 9.2.5 (LTP Section 2.5) Approach 9.2.6 (LTP Section 2.6) Item pass/fail criteria 9.2.7 (LTP Section 2.7) Suspension criteria and resumption requirements 9.2.8 (LTP Section 2.8) Test deliverables  |  6.2.3.2 Test Item(s) 7.3.3.4 Traceability + 7.3.4.4 Traceability (in Test Design Specification and Test Case Specification) 6.2.3.3 Test scope 6.2.3.3 Test scope 6.2.6.3 Test design techniques 6.2.6.4 Test completion criteria 6.2.9.1 Suspension and resumption criteria 6.2.6.8 Test deliverables  |
| 9.3 (LTP Section 3) Test management 9.3.1 (LTP Section 3.1) Planned activities and tasks; test progression 9.3.2 (LTP Section 3.2) Environment/infrastructure 9.3.3 (LTP Section 3.3) Responsibilities and authority 9.3.4 (LTP Section 3.4) Interfaces among the parties involved 9.3.5 (LTP Section 3.5) Resources and their allocation 9.3.6 (LTP Section 3.6) Training 9.3.7 (LTP Section 3.7) Schedules, estimates, and costs 9.3.8 (LTP Section 3.8) Risk(s) and contingency(s)  |  6.2.7 Testing activities and estimates 6.2.6.5 Test data requirements 6.2.6.6 Test environment requirements 6.2.8.1 Roles, activities, and responsibilities 6.2.4 Testing communication 6.2.8.1 Roles, activities, and responsibilities 6.2.8.3 Training needs 6.2.9 Schedule 6.2.5 Risk register  |
| 9.4 (LTP Section 4) General 9.4.1 (LTP Section 4.1) Quality assurance procedures 9.4.2 (LTP Section 4.2) Metrics 9.4.3 (LTP Section 4.3) Test coverage 9.4.4 (LTP Section 4.4) Glossary 9.4.5 (LTP Section 4.5) Document change procedures and history  |  Out of scope 5.3.4.7 Metrics to be collected (in Organizational Test Strategy) 6.2.6.4 Test completion criteria (usually included there) 6.2.2.3 Glossary 6.2.1.4 Change history  |

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 121

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| **Level Test Design**   | **Test Design Specification**  |
| 10.1 (LTD Section 1) Introduction 10.1.1 (LTD Section 1.1) Document identifier 10.1.2 (LTD Section 1.2) Scope 10.1.3 (LTD Section 1.3) References  |  7.2.1.1 Unique identification of document 7.2.2.1 Scope 7.2.2.2 References  |
| 10.2 (LTD Section 2) Details of the Level Test Design 10.2.1 (LTD Section 2.1) Features to be tested 10.2.2 (LTD Section 2.2) Approach refinements 10.2.3 (LTD Section 2.3) Test identification 10.2.4 (LTD Section 2.4) Feature pass/fail criteria 10.2.5 (LTD Section 2.5) Test deliverables  |  7.2.3 Feature sets 7.2.3.1 Unique identification of feature set 7.2.3.2 Objective 7.2.3.3 Priority 7.2.3.4 Specific strategy 7.2.3.5 Traceability Per feature set Not included Not included here, see Sub-process Test Plan Not included here, see Sub-process Test Plan  |
| 10.3 (LTD Section 3) General 10.3.1 (LTD Section 3.1) Glossary 10.3.2 (LTD Section 3.2) Document change procedures and history  |  7.2.2.4 Glossary 7.2.1.4 Change history  |
| **Level Test Case**  | **Test Case Specification**  |
| 11.1 (LTC Section 1) Introduction 11.1.1 (LTC Section 1.1) Document identifier 11.1.2 (LTC Section 1.2) Scope 11.1.3 (LTC Section 1.3) References 11.1.4 (LTC Section 1.4) Context 11.1.5 (LTC Section 1.5) Notation for description  |  7.3.1.1 Unique identification of document 7.3.2.1 Scope 7.3.2.2 References Not included 7.3.2.3 Notation convention(s)  |
| 11.2 (LTC Section 2) Details of the Level Test Case 11.2.1 (LTC Section 2.1) Test case identifier 11.2.2 (LTC Section 2.2) Objective 11.2.3 (LTC Section 2.3) Inputs 11.2.4 (LTC Section 2.4) Outcome(s) 11.2.5 (LTC Section 2.5) Environmental needs 11.2.6 (LTC Section 2.6) Special procedural requirements 11.2.7 (LTC Section 2.7) Intercase dependencies  |  7.3.4.1 Unique identification of test case 7.3.4.2 Objective 7.3.4.6 Inputs 7.3.4.7 Expected results 7.3.4.5 Preconditions 7.3.4.5 Preconditions 7.3.4.5 Preconditions  |
| 11.3 (LTC Section 3) General 11.3.1 (LTC Section 3.1) Glossary 11.3.2 (LTC Section 3.2) Document change procedures and history  |  7.3.2.4 Glossary 7.3.1.4 Change history  |

© ISO/IEC 2013 – All rights reserved

### 122 © IEEE 2013 – All rights reserved 

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| **Level Test Procedure**  | **Test Procedure Specification**  |
| 12.1 (LTPr Section 1) Introduction 12.1.1 (LTPr Section 1.1) Document identifier 12.1.2 (LTPr Section 1.2) Scope 12.1.3 (LTPr Section 1.3) References 12.1.4 (LTPr Section 1.4) Relationship to other procedures  |  7.4.1.1 Unique identification of document 7.4.2.1 Scope 7.4.2.2 References   |
| 12.2 (LTPr Section 2) Details of the Level Test Procedure 12.2.1 (LTPr Section 2.1) Inputs, outputs, and special requirements 12.2.2 (LTPr Section 2.2) Ordered description of the steps to be taken by each participant  | No direct correlation  |
| 12.3 (LTPr Section 3) General 12.3.1 (LTPr Section 3.1) Glossary 12.3.2 (LTPr Section 3.2) Document change procedures and history  |  7.4.2.4 Glossary 7.4.1.4 Change history  |
| **Test Log(s)**  | **Test Execution Log**  |
| 13.1 (LTL Section 1) Introduction 13.1.1 (LTL Section 1.1) Document identifier 13.1.2 Scope (LTL Section 1.2) 13.1.3 (LTL Section 1.3) References  |  7.11.1.1 Unique identification of document 7.11.2.1 Scope 7.11.2.2 References   |
| 13.2 (LTL Section 2) Details of the Level Test Log 13.2.1 (LTL Section 2.1) Description 13.2.2 (LTL Section 2.2) Activity and event entries 13.2.2.1 Execution description 13.2.2.2 Procedure results 13.2.2.3 Environmental information 13.2.2.4 Anomalous events 13.2.2.5 Anomaly Report identifiers  |  7.11.3 Events 7.11.3.3 Description   |
| 13.3 (LTL Section 3) General 13.3.1 (LTL Section 6) Glossary  |  7.4.2.4 Glossary  |
| **Anomaly Report(s)**  | **Incident Report**  |
| 14.1 (AR Section 1) Introduction 14.1.1 (AR Section 1.1) Document identifier 14.1.2 (AR Section 1.2) Scope 14.1.3 (AR Section 1.3) References  |  7.12.1.1 Unique identification of document 7.12.2.1 Scope 7.12.2.2 References   |
| 14.2 (AR Section 2) Details of the Anomaly Report 14.2.1 (AR Section 2.1) Summary 14.2.2 (AR Section 2.2) Date anomaly discovered 14.2.3 (AR Section 2.3) Context 14.2.4 (AR Section 2.4) Description of the anomaly 14.2.5 (AR Section 2.5) Impact  |  7.12.3.1 Timing information 7.12.3.3 Context 7.12.3.4 Description of the incident 7.12.3.5 Originator’s assessment of impact  |

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 123

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| 14.2.6 (AR Section 2.6) Originator’s assessment of urgency 14.2.7 (AR Section 2.7) Description of the corrective action 14.2.8 (AR Section 2.8) Status of the anomaly 14.2.9 (AR Section 2.9) Conclusions and recommendations  | 7.12.3.6 Originator’s assessment of urgency Not included 7.12.4.8 Status of the incident Not included  |
| 14.3 (AR Section 3) General 14.3.1 (AR Section 3.1) Document change procedures and history  |  7.12.1.4 Change history  |
| **Level Interim Test Status Report**  | **Test Status Report**  |
| 15.1 (LITSR Section 1) Introduction 15.1.1 (LITSR Section 1.1) Document identifier 15.1.2 (LITSR Section 1.2) Scope 15.1.3 (LITSR Section 1.3) References  |  6.3.1.1 Unique identification of document 6.3.2.1 Scope 6.3.2.2 References  |
| 15.2 (LITSR Section 2) Details of the Level Interim Test Status Report 15.2.1 (LITSR Section 2.1) Test status summary 15.2.2 (LITSR Section 2.2) Changes from plans 15.2.3 (LITSR Section 2.3) Test status metrics  | 6.3.3 Test Status Not included 6.3.3.2 Progress against Test Plan 6.3.3.4 Test measures   |
| 15.3 (LITSR Section 3) General 15.3.1 (LITSR Section 3.1) Document change procedures and history  |  6.3.1.4 Change history  |
| **Level Test Report (LTR)**  | **Test Completion Report (Sub-process Test Completion Report)**  |
| 16.1 (LTR Section 1) Introduction 16.1.1 (LTR Section 1.1) Document identifier 16.1.2 (LTR Section 1.2) Scope 16.1.3 (LTR Section 1.3) References  |  6.4.1.1 Unique identification of document 6.4.2.1 Scope 6.4.2.2 References  |
| 16.2 (LTR Section 2) Details of the Level Test Report 16.2.1 (LTR Section 2.1) Overview of test results 16.2.2 (LTR Section 2.2) Detailed test results 16.2.3 (LTR Section 2.3) Rationale for decisions 16.2.4 (LTR Section 2.4) Conclusions and recommendations  | 6.4.3 Testing performed 6.4.3.1 Summary of testing performed More detailed sub-clauses Not included Not included  |
| 16.3 (LTR Section 3) General 16.3.1 (LTR Section 3.1) Glossary 16.3.2 (LTR Section 3.2) Document change procedures and history  |  6.4.2.3 Glossary 6.4.1.4 Change history  |

© ISO/IEC 2013 – All rights reserved

### 124 © IEEE 2013 – All rights reserved 

| **IEEE 829:2008 Documents and clauses**  | **ISO/IEC/IEEE 29119-3 Described documents and clauses**  |
| --- | --- |
| **Master Test Report**  | **Test Completion Report (Project Test Completion Report)**  |
| 17.1 (MTR Section 1) Introduction 17.1.1 (MTR Section 1.1) Document identifier 17.1.2 (MTR Section 1.2) Scope 17.1.3 (MTR Section 1.3) References  |  6.4.1.1 Unique identification of document 6.4.2.1 Scope 6.4.2.2 References  |
| 17.2 (MTR Section 2) Details of the Master Test Report 17.2.1 (MTR Section 2.1) Overview of all aggregate test results 17.2.2 (MTR Section 2.2) Rationale for decisions 17.2.3 (MTR Section 2.3) Conclusions and recommendations  | 6.4.3 Testing performed 6.4.3.1 Summary of testing performed Included in 6.4.3.1 Not included  |
| 17.3 (MTR Section 3) General 17.3.1 (MTR Section 3.1) Glossary 17.3.2 (MTR Section 3.2) Document change procedures and history  |  6.4.2.3 Glossary 6.4.1.4 Change history  |

### T.2 Mapping to ISO/IEC 15289: 2011 

| **ISO/IEC 15289:2011**  | **ISO/IEC 15289:2011**  | **ISO/IEC/IEEE 29119-3**  | **ISO/IEC/IEEE 29119-3**  |
| --- | ---: | ---: | --- |
| Acceptance review and testing report  | 10.03  | 6.4 7.10  | Test completion report Test result  |
| Audit report  | 10.09  | - 6.2  | Organizational test specification evaluation result Test plan  |
| Evaluation report  | 10.25  |   |   |
| Integration and test report  | 10.36  | 7.11 7.10  | Test execution log Test result  |
| Operational test procedure  | 10.44  | 7.4.5  | Test procedures  |
| Problem report  | 10.46  | 7.12  | Test incident report  |
| Qualification test procedure  | 10.53  | 7.4.5  | Test procedures  |
| Software requirements specification  | 10.71  | - -  | Test basis Testing requirements  |
| Software unit test procedure  | 10.73  | 7.2 7.4.5  | Test design specification Test procedures  |
| Validation test specification  | 10.86  | 7.3.5  | Test cases  |

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **125**

### T.3 Mapping to BS 7925-2:1998 

| **BS 7925-2:1998**  | **BS 7925-2:1998**  | **ISO/IEC/IEEE 29119-3**  | **ISO/IEC/IEEE 29119-3**  |
| --- | --- | ---: | --- |
| Project Component Test Strategy  | 02-01  | 6.2  | Test plan  |
| Project Component Test Plan  | 02-02  | 6.2  | Test plan  |
| Component Test Plan  | 02-03  |  -  |   |
| Component Test Case  | 02-04  | 7.3.5  | Test cases  |
| Test Record  | 02-05  | 7.11 7.10  | Test execution log Test result  |

### T.4 Mapping to ISO/IEC 25051:2006 

| **ISO/IEC 25051:2006**  | **ISO/IEC 25051:2006**  | **ISO/IEC/IEEE 29119-3**  | **ISO/IEC/IEEE 29119-3**  |
| --- | --- | ---: | --- |
| Testing description: Test case description  | Part 6 03-18  | 7.3.5  | Test cases  |
| Testing description: Test procedure  | Part 6 03-19  | 7.4.5  | Test procedures  |
| Test plan: Approach  | Part 6 04-1  | -  | Testing requirements  |
| Test plan: Pass/fail criteria  | Part 6 04-2  | 6.2  | Test plan  |
| Test plan: Schedule  | Part 6 04-3  | -  | Test resource estimates  |
| Test Plan: Test environment  | Part 6 04-4  | 7.6  | Test environment requirements  |
| Testing results: Anomaly report  | Part 6 09-2  | 7.12  | Test incident report  |
| Testing results: Assessment of the test results  | Part 6 09-3  |  -  |   |
| Testing results: Execution report  | Part 6 09-4  | 7.10  | Test result  |

© ISO/IEC 2013 – All rights reserved

### 126 © IEEE 2013 – All rights reserved 

# Bibliography 

\[1\] BS 7925-1:1998, _Software testing — vocabulary_ 

\[2\] BS 7925-2:1998, _Software testing — software component testing_ 

\[3\] IEC 60300-3-9:1995, _Risk Analysis of technological systems_ 

\[4\] IEEE Std 610.12-1990, _IEEE Standard Glossary of Software Engineering Terminology_ 

\[5\] IEEE Std 829-2008, _IEEE Standard for Software Test Documentation_ 

\[6\] IEEE Std 1008-1987, _IEEE Standard for Software Unit Testing_ 

\[7\] IEEE Std 1012:2012, _IEEE Standard for Software Verification and Validation_ 

\[8\] IEEE Std 1028-2008, _IEEE Standard for Software Reviews and Audits_ 

\[9\] ISO/IEC 12207:2008, _Systems and software engineering — Software life cycle processes_ 

\[10\] ISO/IEC 16085:2006, _IT — Systems and software Engineering — Lifecycle Processes — Risk Management_ 

\[11\] ISO/IEC/IEEE 24765:2010, _Systems and Software Engineering Vocabulary_ 

\[12\] ISO/IEC 25000:2005, _Software Engineering -- Software product Quality Requirements and Evaluation (SQuaRE)_ — _Guide to SQuaRE_ 

\[13\] ISO/IEC 25010:2011, _Systems and Software Engineering — Systems and Software Quality Requirements and Evaluation (SQuaRE) — System and Software quality models_ 

\[14\] ISO/IEC 25051:2006, _Software engineering — Software product Quality Requirements and Evaluation (SQuaRE) — Requirements for quality of Commercial Off-The-Shelf (COTS) software product and instructions for testing_ 

\[15\] ISO/IEC 90003:2004, _Software engineering — Guidelines for the application of ISO 9001:2000 to computer software_ 

\[16\] International Software Testing Qualifications Board (ISTQB), _Standard glossary of terms used in Software Testing_ \[online\]. 2010. Updated 1 April 2010 \[viewed 11 April 2011\]. Available from: http://www.istqb.org/ 

© ISO/IEC 2013 – All rights reserved 

© IEEE 2013 – All rights reserved **127**

# IEEE Notice to Users 

**Notice and Disclaimer of Liability Concerning the Use of IEEE Documents:** IEEE Standards documents are developed within the IEEE Societies and the Standards Coordinating Committees of the IEEE Standards Association (IEEE-SA) Standards Board. IEEE develops its standards through a consensus development process, approved by the American National Standards Institute, which brings together volunteers representing varied viewpoints and interests to achieve the final product. Volunteers are not necessarily members of the Institute and serve without compensation. While IEEE administers the process and establishes rules to promote fairness in the consensus development process, IEEE does not independently evaluate, test, or verify the accuracy of any of the information or the soundness of any judgments contained in its standards. 

Use of an IEEE Standard is wholly voluntary. IEEE disclaims liability for any personal injury, property or other damage, of any nature whatsoever, whether special, indirect, consequential, or compensatory, directly or indirectly resulting from the publication, use of, or reliance upon any IEEE Standard document. 

IEEE does not warrant or represent the accuracy or content of the material contained in its standards, and expressly disclaims any express or implied warranty, including any implied warranty of merchantability or fitness for a specific purpose, or that the use of the material contained in its standards is free from patent infringement. IEEE Standards documents are supplied "**AS IS**." 

The existence of an IEEE Standard does not imply that there are no other ways to produce, test, measure, purchase, market, or provide other goods and services related to the scope of the IEEE standard. Furthermore, the viewpoint expressed at the time a standard is approved and issued is subject to change brought about through developments in the state of the art and comments received from users of the standard. Every IEEE standard is subjected to review at least every ten years. When a document is more than ten years old and has not undergone a revision process, it is reasonable to conclude that its contents, although still of some value, do not wholly reflect the present state of the art. Users are cautioned to check to determine that they have the latest edition of any IEEE standard. 

In publishing and making its standards available, IEEE is not suggesting or rendering professional or other services for, or on behalf of, any person or entity. Nor is IEEE undertaking to perform any duty owed by any other person or entity to another. Any person utilizing any IEEE Standards document, should rely upon his or her own independent judgment in the exercise of reasonable care in any given circumstances or, as appropriate, seek the advice of a competent professional in determining the appropriateness of a given IEEE standard. 

**Translations:** The IEEE consensus development process involves the review of documents in English only. In the event that an IEEE standard is translated, only the English version published by IEEE should be considered the approved IEEE standard. 

**Official Statements:** A statement, written or oral, that is not processed in accordance with the IEEE-SA Standards Board Operations Manual shall not be considered the official position of IEEE or any of its committees and shall not be considered to be, nor be relied upon as, a formal position of IEEE. At lectures, symposia, seminars, or educational courses, an individual presenting information on IEEE standards shall make it clear that his or her views should be considered the personal views of that individual rather than the formal position of IEEE. 

**Comments on Standards:** Comments for revision of IEEE Standards documents are welcome from any interested party, regardless of membership affiliation with IEEE. However, IEEE does not provide consulting information or advice pertaining to IEEE Standards documents. Suggestions for changes in documents should be in the form of a proposed change of text, together with appropriate supporting comments. Since IEEE standards represent a consensus of concerned interests, it is important to ensure that any responses to comments and questions also receive the concurrence of a balance of interests. For this reason, IEEE and the members of its societies and Standards Coordinating Committees are not able to provide an instant response to comments or questions except in those cases where the matter has previously been addressed. Any person who would like to participate in evaluating comments or revisions to an IEEE standard is welcome to join the relevant IEEE working group at http://standards.ieee.org/develop/wg/. 

Comments on standards should be submitted to the following address: Secretary, IEEE-SA Standards Board; 445 Hoes Lane; Piscataway, NJ 08854; USA 

**Photocopies:** Authorization to photocopy portions of any individual standard for internal or personal use is granted by The Institute of Electrical and Electronics Engineers, Inc., provided that the appropriate fee is paid to Copyright Clearance Center. To arrange for payment of licensing fee, please contact Copyright Clearance Center, Customer Service, 222 Rosewood Drive, Danvers, MA 01923 USA; +1 978 750 8400. Permission to photocopy portions of any individual standard for educational classroom use can also be obtained through the Copyright Clearance Center. 

**Patents:** Attention is called to the possibility that implementation of this standard may require use of subject matter covered by patent rights. By publication of this standard, no position is taken by the IEEE with respect to the existence or validity of any patent rights in connection therewith. If a patent holder or patent applicant has filed a statement of assurance via an Accepted Letter of Assurance, then the statement is listed on the IEEE-SA Website at http://standards.ieee.org/about/sasb/patcom/patents.html. Letters of Assurance may indicate whether the Submitter is willing or unwilling to grant licenses under patent rights without compensation or under reasonable rates, with reasonable terms and conditions that are demonstrably free of any unfair discrimination to applicants desiring to obtain such licenses. 

Essential Patent Claims may exist for which a Letter of Assurance has not been received. The IEEE is not responsible for identifying Essential Patent Claims for which a license may be required, for conducting inquiries into the legal validity or scope of Patents Claims, or determining whether any licensing terms or conditions provided in connection with submission of a Letter of Assurance, if any, or in any licensing agreements are reasonable or non-discriminatory. Users of this standard are expressly advised that determination of the validity of any patent rights, and the risk of infringement of such rights, is entirely their own responsibility. Further information may be obtained from the IEEE Standards Association. 

**Participants:** The list of IEEE participants can be accessed at the following URL: http://standards.ieee.org/downloads/29119/29119-3-2013/29119-3- 2013\_wg-participants.pdf. 

***IMPORTANT NOTICE: IEEE Standards documents are not intended to ensure safety, health, or environmental protection, or ensure against interference with or from other devices or networks. Implementers of IEEE Standards documents are responsible for determining and complying with all appropriate safety, security, environmental, health, and interference protection practices and all applicable laws and regulations.*** 

***This IEEE document is made available for use subject to important notices and legal disclaimers. These notices and disclaimers appear in all publications containing this document and may be viewed at http://standards.ieee.org/IPR/disclaimers.html.*** 

© ISO/IEC 2013 – All rights reserved 

### © IEEE 2013 – All rights reserved 

**Abstract:** The purpose of the ISO/IEC/IEEE 29119 series of software testing standards is to define an internationally-agreed set of standards for software testing that can be used by any organization when performing any form of software testing. 

ISO/IEC/IEEE 29119-3 includes templates and examples of test documentation. The templates are arranged within clauses reflecting the overall test process description structure in ISO/IEC/IEEE 29119-2, i.e. by the test process in which they are being produced. Annex A contains outlines of the[ contents](#annex-c-informative) of each document. Annex B contains mappings ISO/IEC/IEEE 29119-2. [Annex C ](#annex-c-informative)contains an overview of the examples. Annexes D to S contain examples of the application of the templates. Annex T provides mappings to existing standards. The Bibliography for this part of ISO/IEC/IEEE 29119 is at the end of the document. ISO/IEC/IEEE 29119-3 supports dynamic testing, functional and non-functional testing, manual and automated testing, and scripted and unscripted testing. The documentation templates defined in ISO/IEC/IEEE 29119-3 can be used in conjunction with any software development lifecycle model. 

**Keywords:** 29119, 29119-1, software testing, Test Planning Process, Test Plan, verification and validation. 

**ICS 35.080 ISBN 978-0-7381-8602-3** 

Price based on 127 pages 

© ISO/IEC 2013 – All rights reserved © IEEE 2013 – All rights reserved 
