  function conversionoverrideflagmessage() {
    const flagVal = $("#CoherentOverrideFlag_TXT").val();
    if (flagVal === undefined) return;
    const isEmpty = flagVal.trim() === "" || flagVal.trim() === "0";

    if (isEmpty) {
      $(".conversion-override-flag").hide();
    } else {
      $(".conversion-override-flag").show();
    }
  }

  $(document).ready(function () {
    if ($(".page-prequotequestions.package-24338").length === 0) return;
    conversionoverrideflagmessage();
  });
  // ============================================================
  // End of Conversion Override Flag Message
  // ============================================================


  // ============================================================
  //Vehicle screen warning messages
  // ============================================================
  function vehicleScreenWarnings(vehYear, agreedValue, vehType) {
    const vehTypeArr = [
      "Collector - Classic",
      "Collector - Antique",
      "Collector - Exotic",
    ];
    const effectiveYear = Number(Instanda.Variables.EffectDateYear_TXT);
    const customWarnings = document.querySelectorAll("#custom-warn-response");
    customWarnings.forEach((warnings) => {
      warnings.remove();
    });

    if (
      agreedValue < 125000 &&
      agreedValue > 0 &&
      effectiveYear > vehYear &&
      effectiveYear - vehYear < 10 &&
      vehTypeArr.includes(vehType)
    ) {
      displayApiWarningMessage(
        "Vehicle age 9 years or newer with agreed value < $125k must be rated as regular use"
      );
    }
    if (
      effectiveYear > vehYear &&
      effectiveYear - vehYear < 25 &&
      vehType == "Collector - Antique"
    ) {
      displayApiWarningMessage(
        "Vehicle age < 25 years cannot be classified as antique"
      );
    }
    if (
      effectiveYear > vehYear &&
      effectiveYear - vehYear < 10 &&
      (vehType == "Collector - Classic" || vehType == "Collector - Antique")
    ) {
      displayApiWarningMessage(
        "Vehicle age < 10 years cannot be classified as Classic or Antique"
      );
    }
    if (
      agreedValue < 25000 &&
      agreedValue > 0 &&
      vehTypeArr.includes(vehType)
    ) {
      displayApiWarningMessage(
        "Collector vehicle with agreed value < $25k must be rated as regular use"
      );
    }
  }

  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
      const selector = '[id$="_AgreedVal_NUM"]';
      const [month, day, year] =
      Instanda.Variables.EffectiveDate_DATE.split(" ")[0].split("/");
      const effectiveDate = new Date(year, month - 1, day); // month-1 because JS treats Jan as 0
      const premState = Instanda.Variables.StateShort;
      const validStates = [
        ["IL", "CT"],
        ["MO", "OK", "FL"],
        ["AR", "MT", "VA", "TN"],
        ["UT"],
        ["TX"],
      ];

      const internalUserRefs = [0, 1, 2, 3];

      const rules = [{
          states: validStates[0],
          date: new Date(2025, 5, 1)
        }, // June 1
        {
          states: validStates[1],
          date: new Date(2025, 7, 6)
        }, // Aug 6
        {
          states: validStates[2],
          date: new Date(2025, 8, 15)
        }, // Sept 15
        {
          states: validStates[3],
          date: new Date(2025, 10, 5)
        }, // Nov 5
        {
          states: validStates[4],
          date: new Date(2025, 11, 17)
        }, // Dec 17
      ];

      const isValid = rules.some(
        (rule) => rule.states?.includes(premState) && effectiveDate >= rule.date
      );

      if (
        isValid &&
        !internalUserRefs.includes(
          Instanda.Variables.PCSReferralLevel_TXT_DEFAULT
        )
      ) {
        $(document)
          .off("input.vinWarnings")
          .on("input.vinWarnings", selector, function () {
            const miIndex = this.id.match(/MI(\d+)/)?. [1];
            if (!miIndex) return;

            const modYear = Number($(`#Vehicle_${miIndex}_ModYear_NUM`).val());
            const agreedVal = Number($(`#Vehicle_${miIndex}_AgreedVal_NUM`).val().replace(/,/g, ""));
            const vehType = $(`#Vehicle_${miIndex}_VehType_CHOICEP`).val();
            if (
              Instanda.Variables.CreatedFrom == "NewBusiness" &&
              Instanda.Variables.ConvertedPolicy_YN == "No"
            ) {
              vehicleScreenWarnings(modYear, agreedVal, vehType);
            } else if (
              Instanda.Variables.CreatedFrom == "MTA" &&
              $(`#Vehicle_${miIndex}_TransactType_TXT`).val() == `MTA${Instanda.Variables.MTA_COUNT}`
            ) {
              console.log("Vehicle Screen Warnings for MTA Triggered");
              vehicleScreenWarnings(modYear, agreedVal, vehType);
            } else if (
              Instanda.Variables.CreatedFrom == "Renewal" &&
              $(`#Vehicle_${miIndex}_TransactType_TXT`).val() ==
              `RENEW${Instanda.Variables.RENEWAL_COUNT}`
            ) {
              vehicleScreenWarnings(modYear, agreedVal, vehType);
            }
          });
      }
    }
  });
  // ============================================================
  //Vehicle screen warning messages ends here
  // ============================================================

  // ============================================================
  //Vehicle VIN Warnings - Vin Rules Auto
  // ============================================================
  function vinRulesAuto(mod_vin, mod_year) {
    // Previously, passing an undefined/null VIN would throw on .length or char access.
    if (!mod_vin || typeof mod_vin !== "string" || !mod_year) return;

    mod_year = Number(mod_year);
    if (isNaN(mod_year)) return;

    // would cause length and character position checks to give wrong results.
    mod_vin = mod_vin.trim();

    document.querySelectorAll("#custom-warn-response").forEach((w) => w.remove());

    // Years 1965–1969: VIN must be at least 9 digits
    if (mod_year >= 1965 && mod_year <= 1969) {
      if (mod_vin.length < 9)
        displayApiWarningMessage(
          "The VIN for model years 1965 to 1969 must be at least 9 digits long."
        );
    }

    // Years 1970–1980: VIN must be at least 10 digits
    if (mod_year >= 1970 && mod_year <= 1980) {
      if (mod_vin.length < 10)
        displayApiWarningMessage(
          "The VIN for model years 1970 to 1980 must be at least 10 digits long."
        );
    }

    // Years 1981–2009: positional character type checks
    if (mod_year >= 1981 && mod_year <= 2009) {
      if (mod_vin.length >= 5) {
        if (!(/^[a-zA-Z]$/.test(mod_vin[3]) && /^[a-zA-Z]$/.test(mod_vin[4])))
          displayApiWarningMessage(
            "The 4th and 5th digits of the VIN must be alphabetic."
          );
      }

      if (mod_vin.length >= 7) {
        if (!(/^\d$/.test(mod_vin[5]) && /^\d$/.test(mod_vin[6])))
          displayApiWarningMessage(
            "The 6th and 7th digits of the VIN must be numeric."
          );
      }
    }

    // Years 1981+: standard 17-char VIN rules
    if (mod_year >= 1981) {
      if (mod_vin.length < 17)
        displayApiWarningMessage(
          "The VIN for model years 1981 to current must be 17 digits long."
        );

      if (/[ioq]/i.test(mod_vin))
        displayApiWarningMessage(
          "The VIN must not include letters 'I', 'O' and 'Q'."
        );

      if (!/\d{4}$/.test(mod_vin))
        displayApiWarningMessage(
          "The last 4 digits of the VIN must be numeric."
        );

      // FIX-4: positional guards before accessing mod_vin[9] and mod_vin[8]
      if (mod_vin.length >= 10 && /[ioquz0]/i.test(mod_vin[9]))
        displayApiWarningMessage(
          "The 10th digit of the VIN cannot be letters I, O, Q, U, Z or the digit 0."
        );

      if (mod_vin.length >= 9 && !/^[0-9x]$/i.test(mod_vin[8])) // FIX-5: was [0-9x]+ (+ is wrong on a single char)
        displayApiWarningMessage(
          "The 9th digit of the VIN must be numeric or the letter 'X'."
        );

      // FIX-6: The original regex allowed spaces via \s inside [^a-zA-Z0-9\s]
      // and then re-checked /\s/ separately — redundant and confusing.
      // Simplified: one check for anything that isn't alphanumeric.
      if (/[^a-zA-Z0-9]/.test(mod_vin))
        displayApiWarningMessage(
          "The VIN must not include special characters and spaces."
        );
    }

    // Years 2010+: 7th digit must be alphabetic
    if (mod_year >= 2010) {
      // FIX-4: guard before accessing mod_vin[6]
      if (mod_vin.length >= 7 && !/^[a-zA-Z]$/.test(mod_vin[6]))
        displayApiWarningMessage(
          "The 7th digit of the VIN must be alphabetic."
        );
    }
  }
  // ============================================================
  //VIN Warnings code ends here
  // ============================================================

  // ============================================================
  // Hiding uploaded docs on Auto
  // ============================================================
  function hideUploadedDocs() {

    const params = new URLSearchParams(window.location.search);
    const quoteRef = params.get("quoteRef");
    if (!quoteRef) {
      console.warn("[hideUploadedDocs] quoteRef not found in URL — aborting.");
      return;
    }

    const allDownloadDocLinks = document.querySelectorAll('a[href*="/DownloadDocument"]');
    const prevTransLinks = Array.from(allDownloadDocLinks).filter(
      (link) => !link.href.includes(`quoteRef=${quoteRef}`)
    );
    const currentTransLinks = Array.from(allDownloadDocLinks).filter(
      (link) => link.href.includes(`quoteRef=${quoteRef}`)
    );

    const hashMap = new Map();
    prevTransLinks.forEach((link) => {
      const name = link.innerText.trim(); // FIX-5: trim whitespace so "Doc Name " and "Doc Name" don't count as different keys
      hashMap.set(name, (hashMap.get(name) ?? 0) + 1);
    });

    // Hide current transaction docs that also exist in previous transactions
    for (let i = currentTransLinks.length - 1; i >= 0; i--) {
      const name = currentTransLinks[i].innerText.trim();
      if (hashMap.get(name) > 0) {

        const parent = currentTransLinks[i].parentElement;
        if (parent) {
          parent.style.display = "none";
          hashMap.set(name, hashMap.get(name) - 1);
        }
      }
    }
  }

  $(document).ready(function () {
    if (
      $(".page-agentalldocs.package-24338").length > 0 &&
      Instanda.Variables.CreatedFrom === "MTA" && document.querySelectorAll('a[href*="/DownloadDocument"]').length > 0) {
      hideUploadedDocs();
    }
  });
  // ============================================================
  // End of Hiding uploaded docs on Auto
  // ============================================================

  // ============================================================
  // Disabling Auto submission if more than 50 Vehicles
  // ============================================================
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-1.package-24338").length === 0) return;

    // FIX-1: Was isReadOnlyView (no parentheses) — this checks if the function
    // EXISTS (always truthy) instead of calling it, so the block never ran for anyone.
    if (isReadOnlyView()) return;

    // FIX-2: || between two sources is correct, but wrap the whole expression
    // in Number() rather than relying on implicit coercion inside the OR.
    // Also added explicit NaN fallback to 0 so the isNaN guard below is cleaner.
    const rawLevel =
      Instanda.Variables.PCSReferralLevel ||
      Instanda.Variables.SalespersonReferralLevel;
    const referralLevel = Number(rawLevel);

    $('button[name="continueButton"][formaction="QuickQuoteQuestionsContinue"]')
      .off("click.vehicleCountGuard")
      .on("click.vehicleCountGuard", function (event) {

        if (isNaN(referralLevel)) {
          console.warn("[VehicleCountGuard] referralLevel is not a valid number — guard skipped.");
          return;
        }

        if ($("#Vehiclecount_YNPYes").is(":checked") && referralLevel < 4) {
          event.preventDefault();
          event.stopImmediatePropagation();

          // Safety net: also block if Instanda triggers via form submit directly
          const $form = $(this).closest("form");
          $form.off("submit.vehicleCountGuard").on("submit.vehicleCountGuard", function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            $form.off("submit.vehicleCountGuard"); // unbind after one block so future submits aren't affected
          });

          displayApiErrorMessage(
            "Only a PCS Underwriter or Operations team is authorized to quote this policy. " +
            "If you need assistance, please contact your assigned underwriter or contact (866)-856-6858."
          );
        }
      });
  });
  // ============================================================
  // End of Disabling Auto submission if more than 50 Vehicles
  // ============================================================

  // ============================================================
  // Auto - Documents mapping variable
  // ============================================================
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-1.package-24338").length === 0) return;

    function fillSpouseName() {
      // FIX: Guard moved INSIDE the function so it protects both the on-load
      // call AND the form submit handler. Previously the guard was only outside,
      // meaning the submit path could still write fields in readonly mode.
      if (isReadOnlyView()) return;

      try {
        const total = Number($("#AdditionalNameInsured_MI_Count").val()) || 0;
        let idCardValue = "";

        for (let idx = 1; idx <= total; idx++) {
          const spouseText = $(`input[id="AdditionalNameInsured_MI${idx}_AdditionalName_TXT"]`).val();
          const relationType = $(`select[id="AdditionalNameInsured_MI${idx}_Relationship_CHOICE"]`).val();
          const $addInsDOB = $(`input[id="AdditionalNameInsured_MI${idx}_AddInsuredDOB_DATE"]`);

          if ($addInsDOB.length > 0 && $addInsDOB.val() === "1/1/9999") {
            $addInsDOB.val("");
          }

          if (
            relationType === "Spouse / Domestic Partner" &&
            idCardValue === "" &&
            spouseText
          ) {
            idCardValue = spouseText;
          }
        }

        $("input[name='AddInsuredNameIDCARD_TXT']").val(idCardValue);

      } catch (error) {
        console.error("[fillSpouseName] Error:", error);
      }
    }

    fillSpouseName();

    const $form = $("button[name='continueButton']").closest("form");
    if ($form.length > 0) {
      $form.off("submit.fillSpouseName").on("submit.fillSpouseName", fillSpouseName);
    }
  });
  // ============================================================
  // End of Auto - Documents mapping variable
  // ============================================================

  //Auto Update button quick quote//

  function maybeAutoContinue() {
    if (sessionStorage.getItem("autoContinueAfterUpdate") === "true") {
      let elapsed = 0;
      const interval = setInterval(() => {
        $(".spinner").hide();
        // Fastest: look for id first
        let continueBtn =
          document.getElementById("continueButton") ||
          document.querySelector('button[name="continueButton"]');
        if (continueBtn) {
          // *** Make visible before clicking! ***
          //continueBtn.style.display = "";
          continueBtn.disabled = false;

          // Simulate real user event (robust for more UIs)
          continueBtn.dispatchEvent(
            new MouseEvent("mouseover", {
              bubbles: true,
            })
          );
          continueBtn.dispatchEvent(
            new MouseEvent("mousedown", {
              bubbles: true,
            })
          );
          continueBtn.dispatchEvent(
            new MouseEvent("mouseup", {
              bubbles: true,
            })
          );
          continueBtn.dispatchEvent(
            new MouseEvent("click", {
              bubbles: true,
            })
          );

          clearInterval(interval);
          sessionStorage.removeItem("autoContinueAfterUpdate");
          console.log("Auto-clicked Continue button!");
        } else if ((elapsed += 500) > 10000) {
          clearInterval(interval);
          sessionStorage.removeItem("autoContinueAfterUpdate");
          console.warn(
            "Continue button not found for auto-click. Check selector and page HTML."
          );
        }
      }, 500);
    }
  }
  async function clickAndWaitForUpdate() {
    const updBtn = document.querySelector('button[name="updateButton"]');
    if (!updBtn) return;
    // Spinner logic
    if ($(".spinner").length > 0) {
      if (typeof showSpinner === "function") showSpinner();
      $(".spinner").hide();
    } else {
      if (typeof hideSpinner === "function") hideSpinner();
    }
    updBtn.textContent = "Continue";
    sessionStorage.setItem("autoContinueAfterUpdate", "true");
    updBtn.click();
    if (isReadOnlyView()) {
      const continueBtn =
        document.getElementById("continueButton") ||
        document.querySelector('button[name="continueButton"]');
      if (continueBtn) {
        continueBtn.click();
        console.log("Continue button auto-clicked.");
      } else {
        console.warn("Continue button not found for auto-clicking.");
      }
    }
    // Trigger the premiums process
    document.getElementById("Premium").click();
  }

  // ====================================================================
  //Renaming update button to continue and have a Auto Premium button
  // ====================================================================
  $(document).ready(function () {
    // Early return — removes one level of nesting
    if ($(".page-quickquote.package-24338").length === 0) return;

    // Helper: find continue button — called in multiple places so extracted once
    const getContinueBtn = () =>
      document.getElementById("continueButton") ||
      document.querySelector('button[name="continueButton"]');

    // Hide continue button on load
    const continueBtn = getContinueBtn();
    if (continueBtn) {
      continueBtn.style.display = "none";
    }

    const updBtn = document.querySelector('button[name="updateButton"]');
    // meaning the button was recreated on every load.
    if (updBtn && !document.getElementById("Premium")) {
      const btnClasses = continueBtn?.getAttribute("class") ||
        "instanda-button instanda-quote-continue-button btn btn-primary";

      const premiumsBtn = document.createElement("button");
      premiumsBtn.type = "button";
      premiumsBtn.style.display = "none";
      premiumsBtn.id = "Premium";
      premiumsBtn.name = "Premium";
      premiumsBtn.className = btnClasses;
      premiumsBtn.innerHTML = 'Premiums <i class="fa fa-caret-right"></i>';

      updBtn.parentNode.insertBefore(premiumsBtn, updBtn);
    }

    if (!updBtn) return; // nothing more to do if update button absent

    updBtn.textContent = "Continue";

    // Prevent duplicate handler attachment
    if (updBtn.dataset.HandlerAttached) return;
    updBtn.dataset.HandlerAttached = "true";

    let isProcessing = false;

    updBtn.addEventListener("click", async function (e) {
      if (isProcessing) {
        e.preventDefault();
        return;
      }
      isProcessing = true;
      e.preventDefault();

      if (typeof showSpinner === "function") showSpinner();

      // Readonly shortcut — skip premium integration entirely
      if (isReadOnlyView()) {
        const cb = getContinueBtn();
        if (cb) {
          cb.click();
        } else {
          console.warn("[QuickQuote] Continue button not found (readonly).");
        }
        if (typeof hideSpinner === "function") hideSpinner();
        isProcessing = false;
        return;
      }

      // Non-readonly: run premium integration
      try {
        const integcallsapi = await coherentpremiumevents(e);
        if (!integcallsapi) throw new Error("Premium event integration failed");

        // Only on success — set flag and auto-click continue
        sessionStorage.setItem("autoContinueAfterUpdate", "true");
        const cb = getContinueBtn();
        if (cb) {
          cb.click();
        } else {
          console.warn("[QuickQuote] Continue button not found after premium call.");
        }

      } catch (error) {
        console.error("[QuickQuote] Premium event error:", error);
        // Do NOT auto-click continue if premium call fails
      } finally {
        // Always clean up spinner and lock regardless of success/failure
        if (typeof hideSpinner === "function") hideSpinner();
        isProcessing = false;
      }
    });
  });
  // ====================================================================
  //End of Renaming update button to continue and have a Auto Premium button
  // ====================================================================

  // ====================================================================
  // Hiding Remove button on Premium screen Auto
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-prequotequestions.page-number-1.package-24338").length === 0) return;
    $(".instanda-multi-item-remove").hide();
  });
  // ====================================================================
  // End of Hiding Remove button on Premium screen Auto
  // ====================================================================


  // ====================================================================
  // Adding OverridePremiums button for Auto
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-prequotequestions.page-number-1.package-24338").length === 0) return;
    if (isReadOnlyView()) return;

    // Coerce to Number — SalespersonReferralLevel is a string from Instanda.
    // "10" > 3 works by coercion but explicit conversion is safer and clearer.
    const referralLevel = Number(Instanda.Variables.SalespersonReferralLevel);
    if (isNaN(referralLevel)) {
      console.warn("[OverridePremiums] SalespersonReferralLevel is not valid — button not added.");
      return;
    }

    if (referralLevel <= 3) return;

    const $pullRight = $("#instandaquestions .container .pull-right");
    const $existingBtn = $pullRight.find("button:nth-child(5)");

    // Fix: original used  !$(...).length > 0  — same precedence bug as seen
    // elsewhere. !length gives a boolean, then > 0 compares boolean to number.
    // Correct intent: button exists AND override button not yet added.
    if ($existingBtn.length === 0 || $pullRight.find(".autooverride").length > 0) return;

    const $overridePremium = $("<button>", {
      type: "button", // always set type on buttons to avoid accidental form submit
      class: "btn btn-primary autooverride",
      html: 'Override Premiums <i class="fa fa-caret-right"></i>',
    }).on("click", async function (event) {
      event.preventDefault();
      const $btn = $(this);

      // Disable button during processing to prevent double-clicks
      $btn.prop("disabled", true).addClass("disabled");

      try {
        showSpinner();
        await clickAndWaitForSave();
        await coherentpremiumevents(event);
        window.location.reload();
      } catch (err) {
        hideSpinner();
        displayApiErrorMessage(
          "There was an error getting premiums." +
          (err?.message ? " Details: " + err.message : "")
        );
        console.error("[OverridePremiums] Error:", err);
      } finally {
        // Re-enable only if page hasn't reloaded (i.e. an error occurred)
        $btn.prop("disabled", false).removeClass("disabled");
      }
    });

    $existingBtn.after($overridePremium);
  });
  // ====================================================================
  // End of Adding OverridePremiums button for Auto
  // ====================================================================

  // ====================================================================
  // Hide Premium Override for Auto brokers
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-prequotequestions.page-number-1.package-24338").length === 0) return;
    const level = Number(Instanda.Variables.SalespersonReferralLevel);

    if (isNaN(level)) {
      console.warn("[Auto Broker Hide] SalespersonReferralLevel not available — skipped.");
      return;
    }
    if (level >= 4) return;

    $("label.control-label").filter(function () {
      return $(this).text().includes("Premium Override");
    }).each(function () {
      $(this).closest(".questionItem").hide();
    });
  });
  // ====================================================================
  // End of Hide Premium Override for Auto brokers
  // ====================================================================

  // ====================================================================
  // BH-21125 — Hide Undisclosed value in Driver Type dropdown for NB
  // ====================================================================
  $(document).ready(function () {
    const TARGET_PAGE = ".page-quickquotequestions.page-number-2.package-24338";

    function hideUndisclosedForNB() {
      // for driver multi-items at all.
      if (Instanda.Variables.CreatedFrom !== "NewBusiness") return;

      document.querySelectorAll('[class*="instanda-multi-item-Driver_MI"]').forEach((parent) => {
        const addDriverMI = extractMINumber(parent, "instanda-multi-item-Driver_MI");

        if (!addDriverMI) return;

        $(`#Driver_MI${addDriverMI}_DriverType_CHOICEP option[value="Undisclosed"]`).remove();
      });
    }

    if (document.querySelector(TARGET_PAGE)) {
      hideUndisclosedForNB();
      return; // no observer needed
    }

    // Page not yet in DOM — observe for it being added
    const observer = new MutationObserver(function () {
      if (!document.querySelector(TARGET_PAGE)) return;
      hideUndisclosedForNB();
      observer.disconnect();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  // ====================================================================
  // End of BH-21125 — Hide Undisclosed Driver Type for NB
  // ====================================================================

  // ====================================================================
  // BH-20876 — Order Insurance Risk Score on Auto driver screen
  // ====================================================================

  const DRIVER_PAGE = ".page-quickquotequestions.page-number-2.package-24338";

  function driverOrderInsRiskUpdated() {
    if (['Delaware', 'California', 'Alaska'].includes(Instanda?.Variables?.PremiumState_CHOICE)) return;

    const norm = (s) => (s || '').toString().trim().toLowerCase();
    const clearRadio = ($yes, $no) => {
      $yes.prop('checked', false).trigger('change');
      $no.prop('checked', false).trigger('change'); // FIX-3: chained .trigger() onto .prop() — removes redundant separate calls
    };

    const drivers = Array.from(document.querySelectorAll('[class*="instanda-multi-item-Driver_MI"]'));
    const policyType = (Instanda?.Variables?.Name_Type_CHOICEP || '').trim();
    const isIndividual = policyType === 'Individual';

    let firstMatchingDriverMI = null;
    if (isIndividual) {
      const insuredFirst = norm(Instanda?.Variables?.FirstName_TXT);
      const insuredLast = norm(Instanda?.Variables?.LastName_TXT);

      // to avoid false positives where every driver with an empty name would match.
      if (insuredFirst && insuredLast) {
        for (const parent of drivers) {
          const addDriverMI = extractMINumber(parent, 'instanda-multi-item-Driver_MI');
          if (!addDriverMI) continue;

          const driverFirst = norm($(`#Driver_MI${addDriverMI}_D_FirstName_TXT`).val());
          const driverLast = norm($(`#Driver_MI${addDriverMI}_D_LastName_TXT`).val());

          if (driverFirst && driverLast && driverFirst === insuredFirst && driverLast === insuredLast) {
            firstMatchingDriverMI = addDriverMI;
            break;
          }
        }
      }
    }

    drivers.forEach((parent, idx) => {
      const addDriverMI = extractMINumber(parent, 'instanda-multi-item-Driver_MI');
      if (!addDriverMI) return;

      const $insRiskYes = $(`#Driver_MI${addDriverMI}_OrderInsRiskScore_YNYes`);
      const $insRiskNo = $(`#Driver_MI${addDriverMI}_OrderInsRiskScore_YNNo`);
      const $insRiskQ = $insRiskYes.closest('.instanda-question-item');
      const $insRiskStsQ = $(`#Driver_MI${addDriverMI}_CreditScoreSts_TXT`).closest('.instanda-question-item');

      makeFRFieldsOptional(addDriverMI);

      if (Instanda?.Variables?.PolicyType_CHOICE === 'BASIC' && Instanda?.Variables?.PremiumState_CHOICE === 'New Jersey') {
        $insRiskYes.prop('disabled', true);
        $insRiskNo.prop('disabled', true);
        return;
      }

      const shouldShow = isIndividual ?
        !!firstMatchingDriverMI && addDriverMI === firstMatchingDriverMI :
        idx === 0;

      if (shouldShow) {
        $insRiskQ.show();
        $insRiskYes.prop('disabled', false);
        $insRiskNo.prop('disabled', false);
        $insRiskStsQ.show();
      } else {
        clearRadio($insRiskYes, $insRiskNo);
        $insRiskQ.hide();
        $insRiskStsQ.hide();
      }
    });
  }

  function makeFRFieldsOptional(addDriverMI) {
    const salesPerson = Number(Instanda?.Variables?.SalespersonReferralLevel);
    const readOnly = typeof isReadOnlyView === "function" && isReadOnlyView();

    const fieldIds = [
      `#Driver_MI${addDriverMI}_FR_Type_TXT`,
      `#Driver_MI${addDriverMI}_FR_DateInvoked_DATE`,
      `#Driver_MI${addDriverMI}_FR_CancellationDate_DATE`,
      `#Driver_MI${addDriverMI}_FR_CaseNumber_TXT`,
      `#Driver_MI${addDriverMI}_FR_State_CHOICE`,
      `#Driver_MI${addDriverMI}_FR_Fee_NUM`,
      `#Driver_MI${addDriverMI}_FR_Reason_TXT`,
    ];

    fieldIds.forEach((selector) => {
      if (!readOnly && salesPerson > 4) {
        $(selector).attr("required", true);
      } else {
        $(selector).removeAttr("required");
      }
    });
  }

  function bindDriverFieldEvents() {
    document.querySelectorAll('[class*="instanda-multi-item-Driver_MI"]').forEach((parent) => {
      const addDriverMI = extractMINumber(parent, "instanda-multi-item-Driver_MI");
      if (!addDriverMI) return;

      $(`#Driver_MI${addDriverMI}_RelationToInsured_CHOICE`)
        .off("change.driverRisk")
        .on("change.driverRisk", driverOrderInsRiskUpdated);

      $(`#Driver_MI${addDriverMI}_D_FirstName_TXT`)
        .off("change.driverRisk keyup.driverRisk")
        .on("change.driverRisk keyup.driverRisk", driverOrderInsRiskUpdated);

      $(`#Driver_MI${addDriverMI}_D_LastName_TXT`)
        .off("change.driverRisk keyup.driverRisk")
        .on("change.driverRisk keyup.driverRisk", driverOrderInsRiskUpdated);
    });
  }

  $(document).ready(function () {
    if (!document.querySelector(DRIVER_PAGE)) return;

    setTimeout(driverOrderInsRiskUpdated, 100);
    bindDriverFieldEvents();

    // Re-run after driver added
    $("#Driver_MIaddButton")
      .off("click.driverRisk")
      .on("click.driverRisk", function () {
        setTimeout(function () {
          driverOrderInsRiskUpdated();
          bindDriverFieldEvents();
        }, 50);
      });

    // Re-run after driver removed
    $(document)
      .off("click.driverRiskRemove", ".instanda-multi-item-remove")
      .on("click.driverRiskRemove", ".instanda-multi-item-remove", function () {
        setTimeout(function () {
          driverOrderInsRiskUpdated();
          bindDriverFieldEvents();
        }, 1000);
      });
  });
  // ====================================================================
  // End of BH-20876 — Order Insurance Risk Score on Auto driver screen
  // ====================================================================

  // ====================================================================
  // Auto — Fill CustomIndex fields for multi-item tracking
  // ====================================================================
  $(document).ready(function () {
    const onTargetPage =
      $(".page-quickquotequestions.page-number-2.package-24338").length > 0 ||
      $(".page-quickquotequestions.page-number-3.package-24338").length > 0 ||
      $(".page-quickquotequestions.page-number-4.package-24338").length > 0;
    if (!onTargetPage) return;

    $('[id$="_CustomIndex"]').each(function () {
      const id = $(this).attr("id");
      if (!id) return;

      const m = id.match(/^[A-Za-z]+_MI(\d+)_/);
      if (m) $(this).val(m[1]);
    });
  });
  // ====================================================================
  // End of Auto — Fill CustomIndex fields
  // ====================================================================

  // ====================================================================
  // Auto — Set VehReadOnly_TXT flag on Renewal and MTA vehicle screen
  // ====================================================================
  $(document).ready(function () {
    if (isReadOnlyView()) return;

    // FIX-1: Early return pattern — removes one level of nesting
    const onTargetPage =
      $(".page-prequotequestions.created-from-renewal.page-number-1.package-24338").length > 0 ||
      $(".page-prequotequestions.created-from-mta.page-number-1.package-24338").length > 0;
    if (!onTargetPage) return;

    // FIX-2: Guard on field existence — if #VehReadOnly_TXT doesn't exist
    // on the page, .val("true") silently does nothing on an empty jQuery
    // set. Explicit guard makes the miss visible during debugging.
    const $field = $("#VehReadOnly_TXT");
    if (!$field.length) {
      console.warn("[VehReadOnly] #VehReadOnly_TXT not found — flag not set.");
      return;
    }

    $field.val("true");
  });
  // ====================================================================
  // End of Auto — Set VehReadOnly_TXT flag
  // ====================================================================

  // ====================================================================
  // BH-13454 — Premium Field / Insurance Risk Score / Credit Address
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-prequotequestions.page-number-1.package-24338").length === 0) return;
    let insRiskScoreValue = $("#InsuranceScore_NUM").val();

    function insRiskScoreWarning() {
      if (insRiskScoreValue === "000") {
        $("#question521458").show();
        $("#question521462").hide();
      } else if (insRiskScoreValue === "001") {
        $("#question521458").hide();
        $("#question521462").show();
      } else {
        $("#question521458").hide();
        $("#question521462").hide();
      }
    }

    insRiskScoreWarning();

    $("#InsuranceScore_NUM")
      .off("input.insRiskScore")
      .on("input.insRiskScore", function () {
        insRiskScoreValue = $(this).val();
        insRiskScoreWarning();
      });

    // ── Credit Address ────────────────────────────────────────────────
    function creditaddress() {
      if (isReadOnlyView()) return;

      function applyAddress2(line2Val) {
        const trimmed = typeof line2Val === "string" ? line2Val.trim() : "";
        if (trimmed) {
          $("#CredAddress2_TXT").val(line2Val);
          $("#question484146").show();
        } else {
          $("#CredAddress2_TXT").val("");
          $("#question484146").hide();
        }
      }

      if (Instanda.Variables.Creditaddress_YNP === "Yes") {
        $("#CredAddress1_TXT").val(Instanda.Variables.CreditAddressLine1_TXT);
        $("#CredAdrsCity_TXT").val(Instanda.Variables.CreditCity_TXT);
        $("#CredAdrsState_TXT").val(Instanda.Variables.CreditState_TXT);
        $("#CredAdrsZip_TXT").val(Instanda.Variables.CreditPostCode_TXT);
        applyAddress2(Instanda.Variables.CreditAddressLine1_TXT);
      } else {
        $("#CredAddress1_TXT").val(Instanda.Variables.MA_AddressLine1_TXT_DD);
        $("#CredAdrsCity_TXT").val(Instanda.Variables.MA_City_TXT_DD);
        $("#CredAdrsState_TXT").val(Instanda.Variables.MA_State_CHOICE_DD);
        $("#CredAdrsZip_TXT").val(Instanda.Variables.MA_Zip_NUM_DD);
        applyAddress2(Instanda.Variables.MA_AddressLine2_TXT_DD);
      }
    }

    creditaddress();

    // ── InsRiskScoreDescription visibility ───────────────────────────
    const READONLY_STYLES = {
      "pointer-events": "none",
      cursor: "not-allowed",
      "background-color": "#eee",
      color: "#888",
    };

    function InsRiskScoreDecriptionVisibility() {
      $('[id^="InsRiskScoreDecription"]').each(function () {
        const $el = $(this);
        const $questionItem = $el.closest(".questionItem");
        const val = $el.val();
        $el.css(READONLY_STYLES);
        if (val && val.trim() !== "") {
          $questionItem.show();
        } else {
          $questionItem.hide();
        }
      });
    }

    InsRiskScoreDecriptionVisibility();
    $('[id^="InsRiskScoreDecription"]')
      .off("input.insRiskDesc change.insRiskDesc")
      .on("input.insRiskDesc change.insRiskDesc", InsRiskScoreDecriptionVisibility);

    // ── Retention Code fields ─────────────────────────────────────────
    function updateRetenCodeFields($premFlat) {
      const $questionItem = $premFlat.closest(".questionItem");
      const $nextRetenCodeItem = $questionItem
        .nextAll(".questionItem")
        .filter(function () {
          return $(this).find('[id$="RetenCode_CHOICE"], [id$="RtnCd_CHOICE"]').length > 0;
        })
        .first();

      const selectedVal = $questionItem.find(".instanda-selected input").val();
      const factorRawVal = $questionItem.find('[id*="Factor_NUM"], [id*="Factor_Ovrd_NUM"]').val();
      const factorVal = parseFloat(factorRawVal);

      const isMandatory =
        selectedVal === "Yes" ||
        (selectedVal === "No" && factorRawVal !== "" && factorVal !== 1);

      const $retenField = $nextRetenCodeItem.find('[id$="RetenCode_CHOICE"], [id$="RtnCd_CHOICE"]');
      const $reqSpan = $nextRetenCodeItem.find('label.control-label > span[style*="color: red"]');

      $retenField.prop("required", isMandatory).prop("disabled", !isMandatory);
      isMandatory ? $reqSpan.show() : $reqSpan.hide();
    }

    const PREM_FLAT_SELECTOR = '[id*="FlatAmnt_CHOICEPNo"], [id*="FlatAmt_CHOICEPNo"]';

    // Initial run
    $(PREM_FLAT_SELECTOR).each(function () {
      updateRetenCodeFields($(this));
    });

    $(PREM_FLAT_SELECTOR).each(function () {
      const $premFlat = $(this);
      const $questionItem = $premFlat.closest(".questionItem");

      $questionItem
        .find('[id*="Factor_NUM"], [id*="Factor_Ovrd_NUM"]')
        .off("change.retenCode input.retenCode")
        .on("change.retenCode input.retenCode", function () {
          updateRetenCodeFields($premFlat);
        });

      $questionItem.find("input")
        .off("click.retenCode change.retenCode")
        .on("click.retenCode change.retenCode", function () {
          updateRetenCodeFields($premFlat);
        });
    });
  });


  // ====================================================================
  // Auto — Claims screen helpers (page 3, package 24338)
  // ====================================================================
  const AUTO_CLAIMS_PAGE = ".page-quickquotequestions.page-number-3.package-24338";

  // ── hideStateSelectClaim ─────────────────────────────────────────────
  $(document).ready(function () {
    function hideStateSelectClaim(root) {
      try {
        const $root = root ? $(root) : $(document);
        if (!$root.find(AUTO_CLAIMS_PAGE).length) return;

        const rawValueToSet = Instanda?.Variables?.PremiumState_CHOICE;
        if (rawValueToSet == null) return;

        const valueToSet = String(rawValueToSet);

        $root.find(".hideStateAdvChoiceClaim").each(function () {
          const $selects = $(this).find(".instanda-question-hierarchy").first().find("select");
          if (!$selects.length) return;

          $selects.each(function () {
            const selectEl = this;
            const $sel = $(selectEl);
            if (!selectEl.options?.length) return;

            const hasOption = Array.from(selectEl.options).some((o) => String(o.value) === valueToSet);
            if (hasOption && String($sel.val()) !== valueToSet) {
              Array.from(selectEl.options).forEach((opt) => opt.removeAttribute("selected"));
              const optToSelect = Array.from(selectEl.options).find((o) => String(o.value) === valueToSet);
              if (optToSelect) {
                optToSelect.setAttribute("selected", "selected");
                selectEl.value = optToSelect.value;
                $sel.trigger("change");
                selectEl.dispatchEvent(new Event("change", {
                  bubbles: true
                }));
              }
            }
            $sel.hide();
          });
        });
      } catch (e) {
        console.error("[hideStateSelectClaim] Error:", e);
      }
    }

    hideStateSelectClaim();
    setTimeout(hideStateSelectClaim, 1000);

    $("#AddClaim_MIaddButton").off("click.stateClaim").on("click.stateClaim", function () {
      hideStateSelectClaim();
    });
    $("#Infraction_MIaddButton").off("click.stateClaim").on("click.stateClaim", function () {
      hideStateSelectClaim();
    });

    if (!document.querySelector(AUTO_CLAIMS_PAGE)) return;

    // ── Shared helpers ──────────────────────────────────────────────
    function selectElementValueFromOptions(selectElementInput, valueToSelect) {
      const selectElement = selectElementInput;
      if (!selectElement || !selectElement[0]) return;
      const optionToSelect = Array.from(selectElement[0].options).find((opt) => opt.value === valueToSelect);
      if (!optionToSelect) return;
      Array.from(selectElement[0].options).forEach((opt) => opt.removeAttribute("selected"));
      optionToSelect.setAttribute("selected", "selected");
      selectElement.val(optionToSelect.value).trigger("change");
    }

    function setNoInYN($yes, $no) {
      $yes.prop("checked", false).parent().removeClass("instanda-selected").addClass("instanda-unselected");
      $no.prop("checked", true).parent().removeClass("instanda-unselected").addClass("instanda-selected");
    }

    function selectSecondOption($select) {
      const $second = $select.find("option").eq(1);
      if ($second.length) $select.val($second.val()).trigger("change");
    }

    // ── Infraction MI logic ─────────────────────────────────────────
    (function () {
      const parentSelector = '[class*="instanda-multi-item-Infraction_MI"]';
      const prefixInfraction = "instanda-multi-item-Infraction_MI";
      const convictionSelector = '[id^="Infraction_MI"][id$="_ConvictionValues_TXT"]';

      // FIX-7: Shared readonly style constant
      const LOCK_STYLES = {
        "pointer-events": "none",
        cursor: "not-allowed",
        "background-color": "#eee",
        color: "#888"
      };

      function setAndDisableInfractionSource($src) {
        selectElementValueFromOptions($src, "Manual");
        $src.css(LOCK_STYLES);
      }

      function setAndHideInfractionPointsValue(miNumber, $points, $pointsUI) {
        const $src = $(`#Infraction_MI${miNumber}_Infraction_Source_CHOICEP`);
        if ($src.val() !== "Manual") return;
        selectSecondOption($points);
        $pointsUI.val($points.val()).trigger("change");
      }

      function showRecklessDrivingDeath($infractionVal, $recklessQ, $recklessYes, $recklessNo) {
        if ($infractionVal.val() === "RECKLESS DRIVING") {
          $recklessQ.removeClass("hidden");
        } else {
          setNoInYN($recklessYes, $recklessNo);
          $recklessQ.addClass("hidden");
        }
      }

      function handleConvictionChangeById(id) {
        const m = (id || "").match(/Infraction_MI(\d+)_ConvictionValues_TXT/);
        if (!m) return;
        const mi = m[1];

        setAndHideInfractionPointsValue(
          mi,
          $(`#Infraction_MI${mi}_ConvictionPoints`),
          $(`#Infraction_MI${mi}_C_Points_DI_NUM`)
        );

        const $infractionVal = $(`#Infraction_MI${mi}_ConvictionValues_TXT`);
        const $recklessYes = $(`#Infraction_MI${mi}_RecklessDrivingDeath_YNYes`);
        const $recklessNo = $(`#Infraction_MI${mi}_RecklessDrivingDeath_YNNo`);
        showRecklessDrivingDeath($infractionVal, $recklessYes.closest(".instanda-question-item"), $recklessYes, $recklessNo);
      }

      function setInfractions() {
        document.querySelectorAll(parentSelector).forEach((parent) => {
          const mi = extractMINumber(parent, prefixInfraction);
          if (!mi) return;
          const $src = $(`#Infraction_MI${mi}_Infraction_Source_CHOICEP`);
          const $ln = $(`#Infraction_MI${mi}_Infraction_LexNexAccVialCode_TXT`);
          if ($ln.val() === "" || $src.val() !== "Vendor") setAndDisableInfractionSource($src);
        });

        setupDropdownsForAssignments();
        autoNumbering('div[data-summary-header="Infraction_MI_summary"] .indexing-infractions input');
        $(convictionSelector).each(function () {
          handleConvictionChangeById($(this).attr("id"));
        });
      }

      $(document).off("change.infraction", convictionSelector).on("change.infraction", convictionSelector, function () {
        handleConvictionChangeById($(this).attr("id"));
      });

      const $addBtn = $("#Infraction_MIaddButton");
      if ($addBtn.length) {
        $addBtn.off("click.infractionSetup").on("click.infractionSetup", function () {
          setTimeout(setInfractions, 0);
        });
      }

      setInfractions();
    })();

    // ── Claim MI add button ─────────────────────────────────────────
    const LOCK_STYLES = {
      "pointer-events": "none",
      cursor: "not-allowed",
      "background-color": "#eee",
      color: "#888"
    };

    const $claimAddBtn = $("#Claim_MIaddButton");
    if ($claimAddBtn.length) {
      $claimAddBtn.off("click.claimSetup").on("click.claimSetup", function () {
        document.querySelectorAll('[class*="instanda-multi-item-Claim_MI"]').forEach((parent) => {
          const mi = extractMINumber(parent, "instanda-multi-item-Claim_MI");
          if (!mi) return;
          const $src = $(`#Claim_MI${mi}_Claim_Source_CHOICEP`);
          if ($src.val() !== "Vendor") {
            selectElementValueFromOptions($src, "Manual");
            $src.css(LOCK_STYLES);
          }
          setupDropdownsForAssignments();
          autoNumbering('div[data-summary-header="Claim_MI_summary"] .indexing-infractions input');
        });
      });
    }
  });


  // ====================================================================
  // setFaultCodeBasedOnAccidentDesc
  // ====================================================================
  function setFaultCodeBasedOnAccidentDesc() {
    const UNKNOWN_FAULT_VALUE = "Unknown/Un-determined";
    const accidentPrefix = "instanda-multi-item-Claim_MI";
    const LOCK_STYLES = {
      "pointer-events": "none",
      cursor: "not-allowed",
      "background-color": "#eee",
      color: "#888"
    };
    const UNLOCK_STYLES = {
      "pointer-events": "auto",
      cursor: "pointer",
      "background-color": "",
      color: ""
    };

    function selectElementValueFromOptions($select, valueToSelect) {
      const selectEl = $select?. [0];
      if (!selectEl) return;
      const opt = Array.from(selectEl.options).find((o) => o.value === valueToSelect);
      if (!opt) return;
      selectEl.value = opt.value;
      $select.trigger("change");
    }

    function inferSuffixFromAccidentValue(val) {
      const v = (val || "").toUpperCase().trim();
      if (!v || v.includes("UNKNOWN") || v.includes("UNDETERMIN")) return null;
      const matches = Array.from(v.matchAll(/\b(NAF|AF|COMP)\b/g));
      if (matches.length) return matches[matches.length - 1][1];
      if (/NOT\W*AT\W*FAULT/.test(v)) return "NAF";
      if (/AT\W*FAULT/.test(v)) return "AF";
      if (/\bCOMPREHENSIVE\b/.test(v)) return "COMP";
      return "NAF";
    }

    function updateOne(parent) {
      const mi = extractMINumber(parent, accidentPrefix);
      if (!mi) return;

      const accidentValueEl = document.querySelector(`#Claim_MI${mi}_AccidentValues_TXT`);
      const $faultIndicator = $(`#Claim_MI${mi}_C_FaultIndicator_Auto_TXT`);
      const $source = $(`#Claim_MI${mi}_Claim_Source_CHOICEP`);

      if (!accidentValueEl || !$faultIndicator[0] || !$source[0]) return;

      if ($source.val() !== "Manual") {
        $faultIndicator.css(UNLOCK_STYLES);
        return;
      }

      const suffix = inferSuffixFromAccidentValue(accidentValueEl.value);
      const faultDesc =
        suffix === "AF" ? "At-Fault" :
        suffix === "NAF" ? "Not At-Fault" :
        suffix === "COMP" ? "Comprehensive" :
        UNKNOWN_FAULT_VALUE;

      selectElementValueFromOptions($faultIndicator, faultDesc);
      $faultIndicator.css(suffix ? LOCK_STYLES : UNLOCK_STYLES);
    }

    document.querySelectorAll(`[class*='${accidentPrefix}']`).forEach((p) => updateOne(p));

    $(document)
      .off("change.setFault", '[id$="_AccidentValues_TXT"], [id$="_Claim_Source_CHOICEP"]')
      .on("change.setFault", '[id$="_AccidentValues_TXT"], [id$="_Claim_Source_CHOICEP"]', function () {
        const parent = this.closest(`[class*='${accidentPrefix}']`);
        if (parent) updateOne(parent);
      });
  }

  // ====================================================================
  // disableSourceForVendor (Infraction)
  // ====================================================================
  function disableSourceForVendor() {
    const LOCK_STYLES = {
      "pointer-events": "none",
      cursor: "not-allowed",
      "background-color": "#eee",
      color: "#888"
    };
    document.querySelectorAll("[class*='instanda-multi-item-Infraction_MI']").forEach((parent) => {
      const mi = extractMINumber(parent, "instanda-multi-item-Infraction_MI");
      if (!mi) return;
      const $ln = $(`#Infraction_MI${mi}_Infraction_LexNexAccVialCode_TXT`);
      const $src = $(`#Infraction_MI${mi}_Infraction_Source_CHOICEP`);
      if ($src.val() === "Vendor" || $ln.val() !== "") $src.css(LOCK_STYLES);
    });
  }

  // ====================================================================
  // disableSourceForVendorClaim
  // ====================================================================
  function disableSourceForVendorClaim() {
    const LOCK_STYLES = {
      "pointer-events": "none",
      cursor: "not-allowed",
      "background-color": "#eee",
      color: "#888"
    };
    document.querySelectorAll("[class*='instanda-multi-item-Claim_MI']").forEach((parent) => {
      const mi = extractMINumber(parent, "instanda-multi-item-Claim_MI");
      if (!mi) return;
      const $num = $(`#Claim_MI${mi}_Infraction_ClaimNumber_TXT`);
      const $src = $(`#Claim_MI${mi}_Claim_Source_CHOICEP`);
      if ($src.val() === "Vendor" || $num.val() !== "") $src.css(LOCK_STYLES);
    });
  }

  // ====================================================================
  // Claims page ready blocks — consolidated into one
  // ====================================================================
  $(document).ready(function () {
    if (!document.querySelector(AUTO_CLAIMS_PAGE)) return;

    setFaultCodeBasedOnAccidentDesc();
    disableSourceForVendorClaim();
    disableSourceForVendor();

    $(document)
      .off("change.faultDesc", '[id^="Claim_MI"][id$="_AccidentValues_TXT"]')
      .on("change.faultDesc", '[id^="Claim_MI"][id$="_AccidentValues_TXT"]', setFaultCodeBasedOnAccidentDesc);

    $(document)
      .off("change.claimNum", '[id^="Claim_MI"][id$="_Infraction_ClaimNumber_TXT"]')
      .on("change.claimNum", '[id^="Claim_MI"][id$="_Infraction_ClaimNumber_TXT"]', disableSourceForVendorClaim);

    $(document)
      .off("change.lnCode", '[id^="Infraction_MI"][id$="_Infraction_LexNexAccVialCode_TXT"]')
      .on("change.lnCode", '[id^="Infraction_MI"][id$="_Infraction_LexNexAccVialCode_TXT"]', disableSourceForVendor);
  });


  // ====================================================================
  // Driver name population for Infraction and Claim MI
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-3.package-24338").length === 0) return;

    // duplicated verbatim in setDriverNameAutoInfraction and setDriverNameAutoClaim.
    function parseFirstLastFromDriverString(selectedDriver) {
      const cleaned = selectedDriver.trim().replace(/^\d+\.\s*/, "");
      const parts = cleaned.split(" ").filter(Boolean);
      if (parts.length < 3) return "";
      const firstName = parts[0];
      const lastName = parts[parts.length > 4 ? 2 : 1];
      return `${firstName} ${lastName}`;
    }

    function setDriverNameAutoInfraction() {
      const prefix = "instanda-multi-item-Infraction_MI";
      document.querySelectorAll(`[class*='${prefix}']`).forEach((parent) => {
        const mi = extractMINumber(parent, prefix);
        if (!mi) return;
        const driverField = parent.querySelector(`#Infraction_MI${mi}_Infraction_Driver_TXT`);
        if (!driverField) return;
        // FIX-4: Namespaced event
        driverField.removeEventListener("blur", driverField._blurHandler);
        driverField._blurHandler = function () {
          $(`#Infraction_MI${mi}_Inf_DriverFLName_TXT`).val(parseFirstLastFromDriverString(this.value)).trigger("change");
        };
        driverField.addEventListener("blur", driverField._blurHandler);
      });
    }

    function setDriverNameAutoClaim() {
      const prefix = "instanda-multi-item-Claim_MI";
      document.querySelectorAll(`[class*='${prefix}']`).forEach((parent) => {
        const mi = extractMINumber(parent, prefix);
        if (!mi) return;
        const driverField = parent.querySelector(`#Claim_MI${mi}_Claim_Driver_TXT`);
        if (!driverField) return;
        // FIX-4: Namespaced via stored handler reference to allow removal
        driverField.removeEventListener("blur", driverField._blurHandler);
        driverField._blurHandler = function () {
          $(`#Claim_MI${mi}_Claim_DriverFLName_TXT`).val(parseFirstLastFromDriverString(this.value)).trigger("change");
        };
        driverField.addEventListener("blur", driverField._blurHandler);
      });
    }

    setDriverNameAutoInfraction();
    setDriverNameAutoClaim();

    const $infBtn = $("#Infraction_MIaddButton");
    const $clmBtn = $("#Claim_MIaddButton");
    if ($infBtn.length) $infBtn.off("click.driverNameInf").on("click.driverNameInf", setDriverNameAutoInfraction);
    if ($clmBtn.length) $clmBtn.off("click.driverNameClm").on("click.driverNameClm", setDriverNameAutoClaim);
  });


  // ====================================================================
  // Check Modify Infraction — Claim_MI and Infraction_MI
  // ====================================================================

  // ── Claim_MI ─────────────────────────────────────────────────────────
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-3.package-24338").length === 0) return;

    const CLAIM_FIELDS = [
      "Infraction_BIClaimAmount_NUM", "Infraction_CollClaimAmount_NUM",
      "Infraction_PDClaimAmount_NUM", "Infraction_OthCollClaimAmount_NUM",
      "Claim_HoldForRenewal_YN", "AccidentDeath_YN", "Infraction_ClaimNumber_TXT",
      "Claim_ViolationAccident_DATE", "C_FaultIndicator_Auto_TXT",
      "Infraction_AccidentState_CHOICE", "Claim_Driver_TXT",
    ];

    function checkClaimModified(claimIndex) {
      if ($(`#Claim_MI${claimIndex}_Claim_Source_CHOICEP`).val() !== "Vendor") return;
      for (const field of CLAIM_FIELDS) {
        const $f = $(`#Claim_MI${claimIndex}_${field}`);
        if ($f.length && $f.data("original") !== undefined && $f.val() !== $f.data("original")) {
          $(`#Claim_MI${claimIndex}_Infraction_ModifyInf_YNYes`).prop("checked", true);
          return;
        }
      }
    }

    $('[id^="Claim_MI"]').each(function () {
      const m = ($(this).attr("id") || "").match(/Claim_MI(\d+)/);
      if (!m) return;
      const idx = m[1];

      CLAIM_FIELDS.forEach((field) => {
        const $f = $(`#Claim_MI${idx}_${field}`);
        if (!$f.length) return;
        $f.data("original", $f.val());
        $f.off("change.claimModify").on("change.claimModify", function () {
          $f.data("modified", true);
          safeRun(() => checkClaimModified(idx));
        });
      });

      $(`#Claim_MI${idx}_Claim_Source_CHOICEP`)
        .off("change.claimModify")
        .on("change.claimModify", function () {
          safeRun(() => checkClaimModified(idx));
        });

      $(`#Claim_MI${idx}_Infraction_ModifyInf_YNYes`)
        .off("change.claimModifyYes")
        .on("change.claimModifyYes", function () {
          if (!$(this).is(":checked")) return;
          const anyModified = CLAIM_FIELDS.some((field) => {
            const $f = $(`#Claim_MI${idx}_${field}`);
            return $f.length && $f.data("original") !== undefined && $f.val() !== $f.data("original");
          });
          if (!anyModified) {
            alert('Please modify at least one infraction field before selecting "Modify Infraction?" as "Yes".');
            document.getElementById(`Claim_MI${idx}_Infraction_ModifyInf_YNYes`).checked = false;
            document.getElementById(`Claim_MI${idx}_Infraction_ModifyInf_YNNo`).checked = true;
          }
        });
    });
  });


  // ── Infraction_MI ─────────────────────────────────────────────────────
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-3.package-24338").length === 0) return;

    const INFRACTION_FIELDS = [
      "Infraction_Driver_TXT", "Infraction_HoldForRenewal_YN",
      "Infraction_ViolationAccident_DATE", "Infraction_Conviction_DATE",
    ];

    function checkInfractionModified(infractionIndex) {
      if ($(`#Infraction_MI${infractionIndex}_Infraction_Source_CHOICEP`).val() !== "Vendor") return;
      for (const field of INFRACTION_FIELDS) {
        const $f = $(`#Infraction_MI${infractionIndex}_${field}`);
        if ($f.length && $f.data("original") !== undefined && $f.val() !== $f.data("original")) {
          $(`#Infraction_MI${infractionIndex}_ModifyInf_YNYes`).prop("checked", true);
          return;
        }
      }
    }

    $('[id^="Infraction_MI"]').each(function () {
      const m = ($(this).attr("id") || "").match(/Infraction_MI(\d+)/);
      if (!m) return;
      const idx = m[1];

      INFRACTION_FIELDS.forEach((field) => {
        const $f = $(`#Infraction_MI${idx}_${field}`);
        if (!$f.length) return;
        $f.data("original", $f.val());
        $f.off("change.infractionModify").on("change.infractionModify", function () {
          $f.data("modified", true);
          safeRun(() => checkInfractionModified(idx));
        });
      });

      $(`#Infraction_MI${idx}_Infraction_Source_CHOICEP`)
        .off("change.infractionModify")
        .on("change.infractionModify", function () {
          safeRun(() => checkInfractionModified(idx));
        });

      $(`#Infraction_MI${idx}_ModifyInf_YNYes`)
        .off("change.infractionModifyYes")
        .on("change.infractionModifyYes", function () {
          if (!$(this).is(":checked")) return;
          const anyModified = INFRACTION_FIELDS.some((field) => {
            const $f = $(`#Infraction_MI${idx}_${field}`);
            return $f.length && $f.data("original") !== undefined && $f.val() !== $f.data("original");
          });
          if (!anyModified) {
            alert('Please modify at least one infraction field before selecting "Modify Infraction?" as "Yes".');
            document.getElementById(`Infraction_MI${idx}_ModifyInf_YNYes`).checked = false;
            document.getElementById(`Infraction_MI${idx}_ModifyInf_YNNo`).checked = true;
          }
        });
    });
  });
  // ====================================================================
  // End of BH-16241 Infraction MI and Claim MI — Auto
  // ====================================================================

  // ====================================================================
  // Auto — InsRiskScore table reposition + Vehicle Type Choice sync
  // ====================================================================
  $(document).ready(function () {

    // ── InsRiskScore table reposition ──────────────────────────────────
    if ($(".page-prequotequestions.page-number-1.package-24338").length > 0) {
      const $insRiskTable = $("#InsRiskScoreTable");
      if ($insRiskTable.length) {
        $insRiskTable.closest("div").appendTo($(".questionList.instanda-questionList"));
      } else {
        console.warn("[VehCov] #InsRiskScoreTable not found — reposition skipped.");
      }
    }

    // ── Vehicle Type Choice sync ────────────────────────────────────────
    if ($(".page-quickquote.package-24338").length === 0) return;

    if (isReadOnlyView()) return;

    const $vehCodeChoice = $("#VehCovVehType_CHOICE");

    function updateVehTypeChoiceValue() {
      if (isReadOnlyView()) return;

      $(".hideVehTypeAdvChoice .instanda-question-hierarchy:nth-child(2) select").each(function () {
        const $advVehType = $(this);
        if (!$advVehType.length) return;

        $advVehType.hide();

        const selectEl = $advVehType[0];
        const targetVal = $vehCodeChoice.val();

        if (!selectEl.options?.length) return;
        if (selectEl.value === targetVal) return;

        const optionToSelect = Array.from(selectEl.options).find((opt) => opt.value === targetVal);
        if (!optionToSelect) return;

        selectEl.selectedIndex = optionToSelect.index;
        Array.from(selectEl.options).forEach((opt) => opt.removeAttribute("selected"));
        optionToSelect.setAttribute("selected", "selected");
        selectEl.dispatchEvent(new Event("change", {
          bubbles: true
        }));
      });
    }

    $vehCodeChoice
      .off("change.vehTypeSync")
      .on("change.vehTypeSync", updateVehTypeChoiceValue);

    // Run on load only if a value is already selected
    if ($vehCodeChoice.val()) updateVehTypeChoiceValue();

  });
  // ====================================================================
  // End of Auto — Vehicle Coverage Type sync
  // ====================================================================

  // ====================================================================
  // Auto — Agreed Value → Original Agreed Value Sync (Package 24338)
  // ====================================================================
  $(document).ready(function () {
    // DOM was guaranteed ready.
    if ($(".page-quickquotequestions.page-number-4.package-24338").length === 0) return;
    if (isReadOnlyView()) return;

    const convertedPolicy =
      Instanda.Variables.ConvertedPolicy_YN ??
      Instanda.Variables.ConvertedPolicy_YNP;

    const isConverted = convertedPolicy?.toLowerCase() === "yes";

    // syncAgreedValue on every MI iteration.
    const spLevel = Number(Instanda.Variables.SalespersonReferralLevel ?? 0);
    const pcsLevel = Number(Instanda.Variables.PCSReferralLevel ?? 0);
    const canUnlock = spLevel > 3 || pcsLevel > 3;

    const isNewBusiness = Instanda.Variables.CreatedFrom === "NewBusiness";

    const processed = new Set();

    const syncAgreedValue = (mi) => {
      if (isReadOnlyView()) return;
      if (isConverted) return;

      const $agreed = $(`#Vehicle_MI${mi}_AgreedVal_NUM`);
      const $original = $(`#Vehicle_MI${mi}_OriginalAgreedVal_NUM`);

      if (!$agreed.length || !$original.length) return;
      if (processed.has(mi)) return;
      processed.add(mi);

      const initial = $agreed.val();
      const orgVal = $original.val();

      if (isNewBusiness) {
        if (initial !== "") $original.val(initial);
      } else {
        if (initial !== "") $original.val(initial);
      }

      $agreed
        .off(`.syncAgreed${mi}`)
        .on(`input.syncAgreed${mi} change.syncAgreed${mi}`, function () {
          const current = typeof cleanVal === "function" ?
            cleanVal(this.value) :
            this.value;
          $original.val(current || "");
        });

      if (canUnlock) {
        $original
          .prop("readonly", false).removeAttr("readonly")
          .prop("disabled", false).removeAttr("disabled");
        $original.closest(".instanda-question-item").removeClass("readonly");
      }
    };

    const processAll = () => {
      if (isReadOnlyView()) return;

      document.querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]').forEach((container) => {
        const match = container.className.match(/instanda-multi-item-Vehicle_MI(\d+)/);
        if (match) syncAgreedValue(parseInt(match[1], 10));
      });
    };

    processAll();

    $(document)
      .off("click.agreedValueSync", "#Vehicle_MIaddButton")
      .on("click.agreedValueSync", "#Vehicle_MIaddButton", () => setTimeout(processAll, 250));

    $(document)
      .off("change.agreedValueSync", 'label:has([id$="_NewlyAddedToPolicy_YNYes"]), label:has([id$="_NewlyAddedToPolicy_YNNo"])')
      .on("change.agreedValueSync", 'label:has([id$="_NewlyAddedToPolicy_YNYes"]), label:has([id$="_NewlyAddedToPolicy_YNNo"])', () => setTimeout(processAll, 150));

    const vehicleMIObserver = new MutationObserver((mutations) => {
      if (isReadOnlyView()) return;

      const hasNewVehicleMI = mutations.some((m) => [...m.addedNodes].some(
        (n) => n.nodeType === 1 && n.matches?.('[class*="instanda-multi-item-Vehicle_MI"]')
      ));

      if (hasNewVehicleMI) {
        processed.clear();
        setTimeout(processAll, 200);
      }
    });

    vehicleMIObserver.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
  // ====================================================================
  // End of Auto — Agreed Value Sync
  // ====================================================================

  // ====================================================================
  // Auto — Infraction changes on Driver screen (page 2, package 24338)
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-2.package-24338").length === 0) return;

    // ── Hide/sync infraction state select ────────────────────────────
    function hideStateSelectInfraction1() {
      try {
        $(".hideStateAdvChoiceInfraction .instanda-question-hierarchy:first-child select").each(function () {
          const $sel = $(this);
          const selectEl = $sel[0];
          const target = Instanda.Variables.PremiumState_CHOICE;

          // FIX-3: Guard on options length before accessing — same pattern fixed elsewhere
          if (!selectEl.options?.length) return;
          if (selectEl.value === target) {
            $sel.hide();
            return;
          } // already correct, just hide

          const opt = Array.from(selectEl.options).find((o) => o.value === target);
          if (opt) {
            Array.from(selectEl.options).forEach((o) => o.removeAttribute("selected"));
            opt.setAttribute("selected", "selected");
            selectEl.value = opt.value;
            selectEl.dispatchEvent(new Event("change", {
              bubbles: true
            })); // FIX-4: bubbles:true
          }
          $sel.hide();
        });
      } catch (e) {
        console.error("[InfractionDriver] hideStateSelectInfraction1 error:", e);
      }
    }

    // ── show/hide infraction fields ───────────────────────────────────
    function showHideInfraction(
      $source, $mvrHit,
      $infractionQ, $pointsQ, $advInfractionQ
    ) {
      if (
        $source.val() === "Vendor" &&
        $mvrHit.val() === "Hit Found"
      ) {
        $infractionQ.removeClass("hidden");
        $pointsQ.removeClass("hidden");
        $advInfractionQ.addClass("hidden");
      } else {
        $infractionQ.addClass("hidden");
        $pointsQ.addClass("hidden");
        $advInfractionQ.removeClass("hidden");
      }
    }

    // ── Driver MI loop ────────────────────────────────────────────────
    const PREFIX = "instanda-multi-item-Driver_MI";

    document.querySelectorAll(`[class*="${PREFIX}"]`).forEach((parent) => {
      const driverMI = extractMINumber(parent, PREFIX);
      if (!driverMI) return;

      for (let infrNum = 1; infrNum <= 13; infrNum++) {
        const base = `#Driver_MI${driverMI}_Infraction${infrNum}`;

        const $source = $(`${base}_Source_TXT`);
        const $mvrHit = $(`${base}_MVRStatus_TXT`);
        const $infractionVal = $(`${base}_InfValuesIntg_TXT`);
        const $pointsVal = $(`${base}_PointsIntg_TXT`);
        const $advInfractionVal = $(`${base}_InfractionValues`);
        const $addBtn = $(`${base}_Add_YNPYes`);

        const $infractionQ = $infractionVal.closest(".instanda-question-item");
        const $pointsQ = $pointsVal.closest(".instanda-question-item");
        const $advInfractionQ = $advInfractionVal.closest(".instanda-question-item");

        // Initial display on page load
        showHideInfraction($source, $mvrHit, $infractionQ, $pointsQ, $advInfractionQ);

        // if the loop somehow runs more than once for the same driver/infraction.
        const ns = `.infrDriver${driverMI}Inf${infrNum}`;

        $addBtn.off(`click${ns}`).on(`click${ns}`, function () {
          hideStateSelectInfraction1();
          showHideInfraction($source, $mvrHit, $infractionQ, $pointsQ, $advInfractionQ);
        });

        $source.off(`change${ns}`).on(`change${ns}`, function () {
          hideStateSelectInfraction1();
          showHideInfraction($source, $mvrHit, $infractionQ, $pointsQ, $advInfractionQ);
        });

        $mvrHit.off(`change${ns}`).on(`change${ns}`, function () {
          showHideInfraction($source, $mvrHit, $infractionQ, $pointsQ, $advInfractionQ);
        });
      }
    });

    // Run state select sync on load
    hideStateSelectInfraction1();
  });
  // ====================================================================
  // End of Auto — Infraction Driver screen
  // ====================================================================

  // ====================================================================
  // Auto — Average Annual Miles update alert on Renewal
  // ====================================================================
  $(document).ready(function () {
    if ($(".page-quickquote.package-24338").length === 0) return;
    if (Instanda.Variables.CreatedFrom !== "Renewal") return;

    alert("Average Annual Miles Values has been updated. Please proceed to Vehicle Information Screen to check.");
  });
  // ====================================================================
  // End of Auto — Renewal Miles Alert
  // ====================================================================
  // ====================================================================
  // Auto — Carfax Vehicle Data Auto Fill
  // ====================================================================
  $(document).ready(function () {
    if (isReadOnlyView()) return;

    const onVehicleCovPage =
      $(".page-quickquotequestions.page-number-4.package-24338").length > 0 &&
      (
        String(Instanda.Variables.IsRenewal).toLowerCase() === "true" ||
        Instanda.Variables.CreatedFrom === "Renewal"
      );

    const onPremiumPage =
      $(".page-prequotequestions.page-number-1.package-24338").length > 0;

    if (!onVehicleCovPage && !onPremiumPage) return;

    function getVehicleDataByPolicyNumber(quoteRef) {
      const query = `SELECT * FROM dbint_344.dbint_344_4100_AUTOVEHICLESCARFAX WHERE QuoteRef='${quoteRef}'`;
      return queryODS(query);
    }

    const quoteRef = Instanda.Variables.QuoteRef;
    if (!quoteRef) {
      console.warn("[Carfax] QuoteRef not available — autofill skipped.");
      return;
    }

    const hasValue = (v) => v !== null && v !== undefined && v !== "";

    getVehicleDataByPolicyNumber(String(quoteRef))
      .then((result) => {
        if (!Array.isArray(result?. [0])) {
          console.error("[Carfax] Expected result[0] to be an array:", result);
          return;
        }

        result[0].forEach((item) => {
          const mi = item.Index;

          if (onVehicleCovPage) {
            if (hasValue(item.CarFax_Rater)) {
              $(`#Vehicle_MI${mi}_AvgAnnualMiles_NUM`).val(item.CarFax_Rater);
            }

            const milesValue = Instanda.Variables.CreatedFrom === "MTA" ?
              item.Prior_AvgAnnualMiles_NUM_DEFAULT_Old_Type :
              item.Prior_AvgAnnualMiles_NUM_DEFAULT;

            if (milesValue != null) {
              $(`#Vehicle_MI${mi}_ExpAnnualMiles_NUM`).val(milesValue);
            }

            if (hasValue(item.CarFax_Rater_SRC)) {
              $(`#Vehicle_MI${mi}_MileageSource_TXT`).val(item.CarFax_Rater_SRC);
            }
          }

          if (onPremiumPage) {
            if (hasValue(item.Coh_VerifiedAvgAnnMiles_DEF)) {
              $(`#Vehicle_MI${mi}_AnnualMilesRate_NUM`).val(item.Coh_VerifiedAvgAnnMiles_DEF);
            }
          }
        });
      })
      .catch((error) => {
        console.error("[Carfax] Error fetching vehicle data:", error);
      });
  });
  // ====================================================================
  // End of Auto — Carfax Auto Fill
  // ====================================================================

  // ====================================================================
  // Common — State code ↔ name mapping utilities
  // ====================================================================
  // Extracted to a shared module-level constant — built once, reused by both.
  const STATE_MAP = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "District Of Columbia",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennessee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming",
  };

  // available in getStateCode without a second manual entry.
  const STATE_NAME_TO_CODE = Object.fromEntries(
    Object.entries(STATE_MAP).map(([code, name]) => [name.toLowerCase(), code])
  );

  function getStateName(stateCode) {

    if (!stateCode) return null;
    return STATE_MAP[String(stateCode).trim().toUpperCase()] ?? null;
  }

  function getStateCode(stateName) {
    if (!stateName) return null;
    return STATE_NAME_TO_CODE[stateName.trim().toLowerCase()] ?? null;
  }

  // ====================================================================
  // End of Common — State mapping utilities
  // ====================================================================

  // ====================================================================
  // BH-24885 — Warn OPS/UW on Vehicle Coverages screen (pkg 24338)
  // ====================================================================

  const BROKER_CODES = new Set(["B0100168", "B0100272", "B0054613", "B0050105"]);

  function checkAndWarnOnCoverage() {
    const NO_COV = "No Coverage";

    const hasNoCoverage =
      $("#CollDedValue").val() === NO_COV ||
      $("#CompDedValue").val() === NO_COV ||
      $("select[id^='Vehicle_'][id$='_MICompDedValue'], select[id^='Vehicle_'][id$='_MICollDedValue']")
      .toArray()
      .some((sel) => $(sel).val() === NO_COV);

    const referralLevel = Number(Instanda.Variables.PCSReferralLevel_TXT);

    if (isNaN(referralLevel)) {
      console.warn("[CoverageWarning] PCSReferralLevel_TXT not available — check skipped.");
      return;
    }

    const shouldWarn =
      BROKER_CODES.has(Instanda.Variables.SelectedBrokerCodeDisp_TXT) &&
      Instanda.Variables.PrivClientGrpHome_YN === "No" &&
      Instanda.Variables.PrivClientGrpCol_YN === "No" &&
      referralLevel > 3 &&
      hasNoCoverage;

    if (shouldWarn) {
      displayApiWarningMessage(
        "Vehicles without comprehensive and collision coverage is not permitted"
      );
    } else {
      $("#custom-warn-response").remove();
    }
  }

  $(document).ready(function () {
    if ($(".page-quickquote.package-24338").length === 0) return;

    checkAndWarnOnCoverage();

    $("#CollDedValue, #CompDedValue")
      .off("change.coverageWarn")
      .on("change.coverageWarn", checkAndWarnOnCoverage);

    $(document)
      .off("change.coverageWarnMI",
        "select[id^='Vehicle_'][id$='_MICompDedValue'], select[id^='Vehicle_'][id$='_MICollDedValue']")
      .on("change.coverageWarnMI",
        "select[id^='Vehicle_'][id$='_MICompDedValue'], select[id^='Vehicle_'][id$='_MICollDedValue']",
        checkAndWarnOnCoverage);
  });
  // ====================================================================
  // End of BH-24885 — Vehicle Coverage Warning
  // ====================================================================

  // ====================================================================
  // Auto — Sync Extended Non-Owned value from Vehicle screen to Coverages
  // ====================================================================
  $(document).ready(function () {

    // ── Vehicle Questions screen (page 4) — capture and store selections ─
    if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
      try {

        const submitButton = document.querySelector("button[type='submit'][name='continueButton']");
        if (!submitButton) {
          console.warn("[ENO] Continue button not found — submit listener not attached.");
        } else {
          const form = submitButton.closest("form");

          const handleSetExtendedNonOwnedList_TXT = () => {
            const totalCount = Number($("#Vehicle_MI_Count").val() || "0");
            const currentData = {};
            for (let i = 1; i <= totalCount; i++) {
              currentData[i] =
                $(`input[name='ExtendNonOwnVehReg_YN__24354__${i}']:checked`).val() || "No";
            }
            $("#ExtendedNonOwnedList_TXT").val(JSON.stringify(currentData));
          };

          if (form) {
            form.removeEventListener("submit", form._enoHandler);
            form._enoHandler = handleSetExtendedNonOwnedList_TXT;
            form.addEventListener("submit", form._enoHandler);
          }
        }
      } catch (error) {
        console.error("[ENO] Error while saving ExtendedNonOwnedList_TXT:", error);
      }
    }

    if ($(".page-quickquote.package-24338").length > 0) {
      if (isReadOnlyView()) return;

      try {
        const raw = Instanda.Variables.ExtendedNonOwnedList_TXT;
        if (!raw) return;

        const ENOList = JSON.parse(raw);


        if (typeof ENOList !== "object" || Array.isArray(ENOList)) {
          console.warn("[ENO] ExtendedNonOwnedList_TXT is not a plain object — skipped.");
          return;
        }

        Object.keys(ENOList).forEach((key) => {
          $(`input[name='ExtendNonOwnVehRegQQA_YN__24354__${key}'][value='${ENOList[key]}']`)
            .prop("checked", true)
            .trigger("click");
        });

      } catch (error) {
        console.error("[ENO] Error while setting ExtendNonOwnVehRegQQA_YN:", error);
      }
    }
  });
  // ====================================================================
  // End of Auto — Extended Non-Owned Value Sync
  // ====================================================================

  //Infaction Driver Name Extraction code for Page 3 Quick Quote Questions AUTO
  //Auto
  if ($(".page-quickquotequestions.page-number-3.package-24338").length > 0) {
    function extractDriverNameFromInfractionHistory(infractionDrivertxt) {
      // Remove leading numbering and dates
      const regex = /\d{1,2}\/\d{1,2}\/\d{4}/;
      const match = infractionDrivertxt.match(regex);
      let namePart;
      if (match) {
        namePart = infractionDrivertxt.substring(0, match.index).trim();
      } else {
        namePart = infractionDrivertxt.trim();
      }
      namePart = namePart.replace(/^\d+\.\s*/, "");

      // Split and grab first & last name (if available)
      const parts = namePart.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return parts[0] + " " + parts[parts.length - 1];
      }
      // If only one name part, return it as is
      return namePart;
    }

    function runExtractionForInfractionDrivers() {
      $(".driverni").each(function () {
        const infractionDrivertxt = $(this).find("input").val();
        const extractedName =
          extractDriverNameFromInfractionHistory(infractionDrivertxt);
        $(this).nextAll(".driverin").first().find("input").val(extractedName);
      });
    }
    $(document).ready(function () {
      // Call the extraction function every 1 second (1000ms)
      setInterval(runExtractionForInfractionDrivers, 1000);
    });
  }
  //Driver Name Extraction code for Page 1 Quick Quote Adjustment AUTO
  //Auto
  if ($(".page-quickquote.package-24338").length > 0) {
    function extractNameFromPrincipalDriver(principalDriverTxt) {
      const regex = /\d{1,2}\/\d{1,2}\/\d{4}/;
      const match = principalDriverTxt.match(regex);
      let namePart;
      if (match) {
        namePart = principalDriverTxt.substring(0, match.index).trim();
      } else {
        namePart = principalDriverTxt.trim();
      }
      namePart = namePart.replace(/^\d+\.\s*/, "");

      return namePart;
    }
    var arr = [];
    document.querySelectorAll(".pdriver").forEach(function (div) {
      // Example: get text content, or use a specific child if needed
      arr.push(div.textContent.trim());
    });
    // Step 2: Fill .drivermn input fields with array values
    document.querySelectorAll(".drivermn").forEach(function (container, idx) {
      var input = container.querySelector("input");
      if (input && arr[idx] !== undefined) {
        input.value = extractNameFromPrincipalDriver(arr[idx]);
      }
    });
  }

  //Update lienholders
  //Auto
  async function lienholderupdate(event) {
    const quoteData = await getQuoteData(event);
    const vehicleAddIns = quoteData.VehicleAddIn_MI || [];
    const consolidatedLienholders = [];

    vehicleAddIns.forEach((addIn) => {
      const typeOfInt = addIn.TypeOfInt_CHOICE;
      if (
        typeOfInt === "Loss Payee" ||
        typeOfInt === "Add. Insured/Loss Payee"
      ) {
        const newLienholder = {
          Lienh_Name_TXT: addIn.AIName_TXT || "",
          Lienh_Unit_TXT: addIn.AIUnit_NUM || "",
          Lienh_AddressLine1_TXT: addIn.AddIntAddressLine1_TXT || "",
          Lienh_AddressLine2_TXT: addIn.AddIntAddressLine2_TXT || "",
          Lienh_City_TXT: addIn.AddIntCity_TXT || "",
          Lienh_ZipCode_TXT: addIn.AddIntPostCode_TXT || "",
          Lienh_State_CHOICE: addIn.AddIntState_TXT || "",
          Lienh_Country_CHOICE: addIn.AddIntCountry_TXT || "",
          Lienh_Email_TXT: addIn.AIEmailAddress_TXT || "",
        };

        // Unique key properties
        const matchIndex = consolidatedLienholders.findIndex(
          (lh) =>
          lh.Lienh_Name_TXT.trim().toLowerCase() ===
          newLienholder.Lienh_Name_TXT.trim().toLowerCase() &&
          lh.Lienh_AddressLine1_TXT.trim().toLowerCase() ===
          newLienholder.Lienh_AddressLine1_TXT.trim().toLowerCase() &&
          lh.Lienh_City_TXT.trim().toLowerCase() ===
          newLienholder.Lienh_City_TXT.trim().toLowerCase() &&
          lh.Lienh_ZipCode_TXT.trim().toLowerCase() ===
          newLienholder.Lienh_ZipCode_TXT.trim().toLowerCase() &&
          lh.Lienh_State_CHOICE.trim().toLowerCase() ===
          newLienholder.Lienh_State_CHOICE.trim().toLowerCase() &&
          lh.Lienh_Country_CHOICE.trim().toLowerCase() ===
          newLienholder.Lienh_Country_CHOICE.trim().toLowerCase()
        );

        if (matchIndex > -1) {
          // Update the existing lienholder with any new non-empty fields
          const existing = consolidatedLienholders[matchIndex];
          Object.keys(newLienholder).forEach((key) => {
            if (newLienholder[key] && newLienholder[key] !== existing[key]) {
              existing[key] = newLienholder[key];
            }
          });
        } else {
          // Insert new lienholder
          consolidatedLienholders.push(newLienholder);
        }
      }
    });

    let updateBody = {
      Lienholder_MI: consolidatedLienholders,
    };

    if (consolidatedLienholders.length > 0) {
      await updateQuoteorPolicydata(event, updateBody);
    }
  }
  //Auto
  $(document).ready(function () {
    if (isReadOnlyView()) {
      return;
    }
    // Only run if the specific page is visible and the count is positive
    if (
      $(".page-quickquote.package-24338:visible").length > 0 &&
      Instanda.Variables.VehicleAddIn_MI_Count > 0
    ) {
      lienholderupdate();
      console.log("Lienholder function called");
    }
  });

  //Auto
  $(document).ready(function () {
    if (isReadOnlyView()) return;
    if (
      $(".page-postquotequestions.page-number-2.package-24338") ||
      $(".page-quickquote.package-24338").length > 0
    ) {
      document.querySelectorAll('[id*="ModYear_NUM"]').forEach(function (elem) {
        // Remove commas from their text content
        elem.textContent = elem.textContent.replace(/,/g, "");
      });
    }
  });
  //end

  //This is for fileds to be readonly  when Reissue endorsement is select for Insured , Driver , Vehicle , Policy coverage Screen
  //Auto
  if (
    $(".page-quickquotequestions.created-from-mta.package-24338").length > 0
  ) {
    $(document).ready(function () {
      var ChangeReason =
        $("#ChangeReason_Choice").val() ||
        Instanda.Variables.ChangeReason_Choice;

      function handleChangeReasonChoice() {
        if ($(".created-from-mta").length && ChangeReason === "Reissue") {
          $(".instanda-quick-quote-questions").css({
            "pointer-events": "none",
            cursor: "not-allowed",
          });

          // Re-enable pointer events for specific exceptions
          $("#ChangeReason_Choice").css("pointer-events", "auto");
          $(".instanda-multi-item-summary-answer").css(
            "pointer-events",
            "auto"
          );
          $('[title="Show More"]').css("pointer-events", "auto");
          $(".instanda-questionHeader.questionHeader.container").css(
            "pointer-events",
            "auto"
          );

          // Greys out all but the whitelisted fields
          $(
              '.instanda-quick-quote-questions select, .instanda-quick-quote-questions input, .instanda-quick-quote-questions [title="Show More"]'
            )
            .not(
              '#ChangeReason_Choice, .instanda-multi-item-summary-answer, [title="Show More"], #DescriptionOfChange_TXT'
            )
            .not(".instanda-questionHeader.questionHeader.container *")
            // DO NOT exclude .instanda-multi-item-remove, so it remains disabled
            .not(".alwayseditable") // <-- add this: don't gray out alwayseditable
            .css({
              "background-color": "#eee",
              opacity: "1",
            });

          // Remove button disabled
          $(".instanda-multi-item-remove.btn.btn-default").css({
            "pointer-events": "none",
            opacity: "0.5",
            "background-color": "#eee",
            cursor: "not-allowed",
          });

          // Keep DescriptionOfChange_TXT enabled
          $("#DescriptionOfChange_TXT")
            .css({
              "pointer-events": "auto",
              "background-color": "",
              opacity: "1",
              cursor: "",
            })
            .prop("readonly", false)
            .prop("disabled", false);

          // RE-ENABLE alwayseditable: pointer-events & styles
          $(".alwayseditable").each(function () {
            $(this)
              .css({
                "pointer-events": "auto",
                "background-color": "",
                opacity: "1",
                cursor: "",
              })
              .prop("readonly", false)
              .prop("disabled", false);
          });
        } else {
          $(".instanda-quick-quote-questions").css({
            "pointer-events": "",
            cursor: "",
          });

          $("#ChangeReason_Choice").css("pointer-events", "");
          $(".instanda-multi-item-summary-answer").css("pointer-events", "");
          $('[title="Show More"]').css("pointer-events", "");
          $(".instanda-questionHeader.questionHeader.container").css(
            "pointer-events",
            ""
          );

          $(
              '.instanda-quick-quote-questions select, .instanda-quick-quote-questions input, .instanda-quick-quote-questions [title="Show More"]'
            )
            .not(
              '#ChangeReason_Choice, .instanda-multi-item-summary-answer, [title="Show More"], #DescriptionOfChange_TXT'
            )
            .not(".instanda-questionHeader.questionHeader.container *")
            .css({
              "background-color": "",
              opacity: "",
            });

          // Restore Remove button to normal
          $(".instanda-multi-item-remove.btn.btn-default").css({
            "pointer-events": "",
            opacity: "",
            "background-color": "",
            cursor: "",
          });

          // Keep DescriptionOfChange_TXT enabled and normal
          $("#DescriptionOfChange_TXT")
            .css({
              "pointer-events": "auto",
              "background-color": "",
              opacity: "1",
              cursor: "",
            })
            .prop("readonly", false)
            .prop("disabled", false);

          // Ensure alwayseditable fields still look and behave normal
          $(".alwayseditable").each(function () {
            $(this)
              .css({
                "pointer-events": "auto",
                "background-color": "",
                opacity: "1",
                cursor: "",
              })
              .prop("readonly", false)
              .prop("disabled", false);
          });
        }
      }

      handleChangeReasonChoice();

      $("#ChangeReason_Choice").on("change", function () {
        ChangeReason = $(this).val();
        handleChangeReasonChoice();
      });
    });
  }
  //This is for Vehicle Coverage screen for 8038 card
  //Auto
  if (
    $(".page-quickquote.created-from-mta.page-number-1.package-24338").length >
    0
  ) {
    $(document).ready(function () {
      var ChangeReason =
        $("#ChangeReason_Choice").val() ||
        Instanda.Variables.ChangeReason_Choice;

      function handleChangeReasonChoice() {
        if ($(".created-from-mta").length && ChangeReason === "Reissue") {
          $(".page-quickquote.created-from-mta.page-number-1").css({
            "pointer-events": "none",
            cursor: "not-allowed",
          });

          // Re-enable pointer events for the dropdown, Show More, Infraction Summary/Detail, multi-item summary answer, and navigation buttons
          $("#ChangeReason_Choice").css("pointer-events", "auto");
          $(".instanda-multi-item-summary-answer").css(
            "pointer-events",
            "auto"
          );
          $('[title="Show More"]').css("pointer-events", "auto");
          $(".instanda-questionHeader.questionHeader.container").css(
            "pointer-events",
            "auto"
          );
          $(
            "#backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button"
          ).css("pointer-events", "auto");

          // Exclude Infraction Summary/Detail, multi-item summary answer, and navigation buttons from greyed-out styling
          $(
              '.page-quickquote.created-from-mta.page-number-1 select, .page-quickquote.created-from-mta.page-number-1 input, .page-quickquote.created-from-mta.page-number-1 [title="Show More"], #backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button'
            )
            .not(
              '#ChangeReason_Choice, .instanda-multi-item-summary-answer, [title="Show More"], #backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button'
            )
            .not(".instanda-questionHeader.questionHeader.container *")
            // DO NOT exclude .instanda-multi-item-remove, so it remains disabled
            .css({
              "background-color": "#eee",
              opacity: "1",
            });

          // Additionally, make sure the Remove button is visually and functionally disabled
          $(".instanda-multi-item-remove.btn.btn-default").css({
            "pointer-events": "none",
            opacity: "0.5",
            "background-color": "#eee",
            cursor: "not-allowed",
          });
        } else {
          $(".page-quickquote.created-from-mta.page-number-1").css({
            "pointer-events": "",
            cursor: "",
          });

          $("#ChangeReason_Choice").css("pointer-events", "");
          $(".instanda-multi-item-summary-answer").css("pointer-events", "");
          $('[title="Show More"]').css("pointer-events", "");
          $(".instanda-questionHeader.questionHeader.container").css(
            "pointer-events",
            ""
          );
          $(
            "#backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button"
          ).css("pointer-events", "");

          $(
              '.page-quickquote.created-from-mta.page-number-1 select, .page-quickquote.created-from-mta.page-number-1 input, .page-quickquote.created-from-mta.page-number-1 [title="Show More"], #backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button'
            )
            .not(
              '#ChangeReason_Choice, .instanda-multi-item-summary-answer, [title="Show More"], #backButton, #continueButton, .instanda-quote-update-button.btn.btn-primary.instanda-button'
            )
            .not(".instanda-questionHeader.questionHeader.container *")
            .css({
              "background-color": "",
              opacity: "",
            });

          // Restore Remove button to normal
          $(".instanda-multi-item-remove.btn.btn-default").css({
            "pointer-events": "",
            opacity: "",
            "background-color": "",
            cursor: "",
          });
        }
      }

      handleChangeReasonChoice();

      $("#ChangeReason_Choice").on("change", function () {
        ChangeReason = $(this).val();
        handleChangeReasonChoice();
      });
    });
  }
  /////Premium Summary  Screen for card 8083
  //Auto
  if (
    $(".page-prequotequestions.created-from-mta.page-number-1.package-24338")
    .length > 0
  ) {
    $(document).ready(function () {
      var ChangeReason =
        $("#ChangeReason_Choice").val() ||
        Instanda.Variables.ChangeReason_Choice;

      function handleChangeReasonChoice() {
        if ($(".created-from-mta").length && ChangeReason === "Reissue") {
          $(".instanda-pre-quote-questions").css({
            "pointer-events": "none",
            cursor: "not-allowed",
          });

          // Re-enable pointer events for the dropdown, First Name field, and Show More
          $("#ChangeReason_Choice").css("pointer-events", "auto");
          $('[title="Show More"]').css("pointer-events", "auto");

          // Apply greyed-out styling to all selects and inputs except the dropdown, First Name field, and Show More
          $(
              '.instanda-pre-quote-questions  select, .instanda-pre-quote-questions  input, .instanda-pre-quote-questions  [title="Show More"]'
            )
            .not('#ChangeReason_Choice, [title="Show More"]')
            .css({
              "background-color": "#eee",
              opacity: "1",
            });
        } else {
          $(".instanda-pre-quote-questions").css({
            "pointer-events": "",
            cursor: "",
          });

          $("#ChangeReason_Choice").css("pointer-events", "");
          $('[title="Show More"]').css("pointer-events", "");
          $(
              '.instanda-pre-quote-questions  select, .instanda-pre-quote-questions  input, .instanda-pre-quote-questions  [title="Show More"]'
            )
            .not('#ChangeReason_Choice, [title="Show More"]')
            .css({
              "background-color": "",
              opacity: "",
            });
        }
      }

      handleChangeReasonChoice();

      $("#ChangeReason_Choice").on("change", function () {
        ChangeReason = $(this).val();
        handleChangeReasonChoice();
      });
    });
  }

  /////Auto BH-12264 Display Rule for Driver Insurance Risk Score////
  //Auto
  $(function () {
    // Only run on the correct page
    if (!$(".page-quickquotequestions.page-number-2.package-24338").length > 0)
      return;
    if (Instanda.Variables.ConvertedPolicy_YN === "Yes") return; // disable the condition in converted policy
    console.log("Start Insurance Risk Score Display Rule code execution");

    const premiumState = Instanda?.Variables?.PremiumState_CHOICE;
    const createdFrom = Instanda?.Variables?.CreatedFrom;

    // Only proceed if state logic applies
    const disableStates = ["Alaska", "California", "Delaware"];
    const mtaStates = ["Texas", "South Carolina"];

    if (
      !disableStates.includes(premiumState) &&
      !(mtaStates.includes(premiumState) && createdFrom === "MTA")
    ) {
      return; // No rules apply, exit early
    }

    // Query all driver multi-item containers
    /* document.querySelectorAll('[class*="instanda-multi-item-Driver_MI"]').forEach((parent) => {
       const addDriverMI = extractMINumber(parent, "instanda-multi-item-Driver_MI");
       if (!addDriverMI) return;
   
       const noRadio = $(`#Driver_MI${addDriverMI}_OrderInsRiskScore_YNNo`);
       const yesRadio = $(`#Driver_MI${addDriverMI}_OrderInsRiskScore_YNYes`);
   
       if (!noRadio.length || !yesRadio.length) return;
   
       // Set 'No' and disable 'Yes'
       if (!noRadio.is(":checked"))
         noRadio.prop("checked", true).trigger("click");
       yesRadio.prop("disabled", true);
     }); */
  });

  /////Symbol disable function//////
  function setSymbol(mi, symbol, disabled, value = null) {
    //BH-27083 code starts here
    const isInternal = Instanda.Variables.SalespersonReferralLevel > 3;
    //BH-27083 code ends here
    // Map plain keys to form field segments
    const symbolMap = {
      liability: "LiabilitySymbol",
      collision: "CollisionSym",
      comprehensive: "ComprehensiveSym",
      medical: "PIPMedSymbol", // THE KEY: medical maps to PIPMedSymbol
      // Add more as needed
    };
    console.log("hey");
    const field = $(`#Vehicle_MI${mi}_DisableStatus_TXT`);
    let statusObj;

    // Parse existing JSON or initialize defaults
    try {
      statusObj = JSON.parse(field.val() || "{}");
    } catch {
      statusObj = {};
    }

    statusObj = Object.assign({
        liability: 0,
        collision: 0,
        comprehensive: 0,
        medical: 0,
      },
      statusObj
    );

    // Update disable state
    statusObj[symbol] = disabled ? 1 : 0;

    // Build selector using mapping
    const mapped =
      symbolMap[symbol] ||
      symbol.charAt(0).toUpperCase() + symbol.slice(1) + "Symbol";
    const sel = `#Vehicle_MI${mi}_${mapped}_NUM`;

    // Apply styles
    if (!isInternal) {
      $(sel).css(
        disabled ? {
          "pointer-events": "none",
          cursor: "not-allowed",
          color: "#888",
          "background-color": "#eee",
        } : {
          "pointer-events": "",
          cursor: "",
          color: "",
          "background-color": "",
        }
      );
    }

    // If value is provided (including ""), set it
    if (value !== null && value !== undefined) {
      $(sel).val(value);
    }

    // Persist back
    field.val(JSON.stringify(statusObj));
  }

  /////Auto BH-12264 Display Rule for Driver Insurance Risk Score code ends here////

  ///////////////AUTO-Vehicle Verisk Display Rules//////////////
  //verisk display rules
  //Auto
  // combined all rules of verisk and vehicle display rules --- Sujish
  $(document).ready(function () {
    if (
      !document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24338"
      )
    )
      return;
    const processedVehicles = new Set();
    let vehicleContainers = [];
    let driversList = [];

    // Fastest MI extraction
    const getMINumber = (el) => {
      const match = el.className.match(/instanda-multi-item-Vehicle_MI(\d+)/);
      return match ? match[1] : null;
    };

    // Update drivers list
    const updateDriversList = () => {
      driversList = (Instanda.Variables.StoreDriverVehAssnmt_TXT || "")
        .split(/\r?\n/)
        .map((d) => d.trim())
        .filter(Boolean);
    };

    // ================================
    // ALL RULES (Verisk + Vehicle Display)
    // ================================
    const runAllRules = (mi) => {
      // === VERISK RULES ===
      runComprehensiveSymbol(mi);
      applyDisableStatus(mi);
      runEngineSize(mi);
      runAntiTheft(mi);
      runPassiveRestraints(mi);
      runAntilock(mi);
      runCostNewMandatory(mi);
      runSafetyFeatures(mi);
      runEVHEVQuestions(mi);
      setupVinStyleDropdown(mi);

      // === VEHICLE DISPLAY RULES ===
      runRepairOrReplacement(mi);
      runHistoricalVehicle(mi);
      runPassengerHazardExclusion(mi);
      runCarfaxOverrides(mi);
      //runAgreedValue(mi);
      runDefaultMarketValue(mi);
      runDaytimeRunningLights(mi);
    };

    ////Disable Fields on load

    // Apply only: reads status, initializes if empty, applies styles
    function applyDisableStatus(mi) {
      // Mapping for keys to actual field segment
      const isInternal = Instanda.Variables.SalespersonReferralLevel > 3;
      if (isInternal) {
        return;
      }

      const symbolMap = {
        liability: "LiabilitySymbol",
        collision: "CollisionSym",
        comprehensive: "ComprehensiveSym",
        medical: "PIPMedSymbol", // map exception here!
      };

      const field = $(`#Vehicle_MI${mi}_DisableStatus_TXT`);
      let disableStat = field.val();
      let statusObj;

      // If empty, initialize defaults
      if (!disableStat || disableStat.trim() === "") {
        statusObj = {
          liability: 0,
          collision: 0,
          comprehensive: 0,
          medical: 0,
        };
        field.val(JSON.stringify(statusObj));
      } else {
        try {
          statusObj = JSON.parse(disableStat);
        } catch {
          statusObj = {};
          disableStat.split(",").forEach((pair) => {
            let [k, v] = pair.split(":");
            if (k && v !== undefined)
              statusObj[k.trim()] = parseInt(v.trim(), 10);
          });
        }
        statusObj = Object.assign({
            liability: 0,
            collision: 0,
            comprehensive: 0,
            medical: 0,
          },
          statusObj
        );
      }

      // Apply styles with proper mapping
      for (const [key, val] of Object.entries(statusObj)) {
        const mapped =
          symbolMap[key] ||
          key.charAt(0).toUpperCase() + key.slice(1) + "Symbol";
        const sel = `#Vehicle_MI${mi}_${mapped}_NUM`;
        $(sel).css(
          val === 1 ? {
            "pointer-events": "none",
            cursor: "not-allowed",
            color: "#888",
            "background-color": "#eee",
          } : {
            "pointer-events": "",
            cursor: "",
            color: "",
            "background-color": "",
          }
        );
      }
    }

    // === VERISK RULES ===
    const runComprehensiveSymbol = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const costNew = $(`#Vehicle_MI${mi}_CostNew_NUM`).val();
      const namedNonOwnerPolicy = Instanda.Variables.NamedNonOwnPol_YN;

      const hiddenTypes = [
        "Misc. - All Terrain Vehicle",
        "Misc. - Golf Cart",
        "Misc. - Nonreg. Dune Buggy",
        "Misc. - Nonreg. Golf Cart",
        "Misc. - Other Trailer",
        "Misc. - Snowmobile",
      ];

      const yes = $(
        `label:has(#Vehicle_MI${mi}_ExtendNonOwnVehReg_YNYes)`
      ).hasClass("instanda-selected");
      const shouldHide = hiddenTypes.includes(type) || yes;

      const isRequired =
        (type === "Regular" && !costNew && namedNonOwnerPolicy !== "Yes") ||
        (type === "Misc. - Motorcycle" && namedNonOwnerPolicy !== "Yes");

      const $field1 = $(`#Vehicle_MI${mi}_ComprehensiveSym_NUM`);
      const $field2 = $(`#Vehicle_MI${mi}_CollisionSym_NUM`);
      const $question1 = $field1.closest(".questionItem");
      const $question2 = $field2.closest(".questionItem");

      $field1.prop("required", false);
      $field2.prop("required", false);

      $question1
        .find("label .required-asterisk")
        .add($question2.find("label .required-asterisk"))
        .remove();

      if (isRequired) {
        $field1.prop("required", true);
        $field2.prop("required", true);
        $question1
          .find("label")
          .add($question2.find("label"))
          .append(
            '<span class="required-asterisk" style="color:red;font-size:16px;"> *</span>'
          );
      }

      if (shouldHide) {
        $question1.hide();
        $question2.hide();
      } else {
        $question1.show();
        $question2.show();
      }
    };

    const runEngineSize = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const isConverted = Instanda.Variables.ConvertedPolicy_YN === "Yes";
      const isGLM25 = Instanda.Variables.RatingStructure1_TXT === "GLM 2.5";

      const showStatesalways = [
        "Florida",
        "Pennsylvania",
        "Texas",
        "New York",
        "South Carolina",
      ];

      const showTypesDefault = [
        "Misc. - Motorcycle",
        "Misc. - Snowmobile",
        "Misc. - All Terrain Vehicle",
      ];

      const showTypesNC = [
        "Misc. - Motorcycle",
        "Misc. - Motorscooter",
        "Misc. - Comm Type Motorcycle",
        "Misc. - Snowmobile",
      ];

      let shouldHide = !showTypesDefault.includes(type);

      if (state === "North Carolina") {
        shouldHide = !showTypesNC.includes(type);
      }

      // Override: for these states on GLM 2.5, do NOT hide
      if (showStatesalways.includes(state) && isGLM25) {
        shouldHide = false;
      }

      const $engine = $(`#Vehicle_MI${mi}_EngineSize_NUM`);
      const $questionItem = $engine.closest(".instanda-question-item");

      $questionItem.toggleClass("hidden", shouldHide);

      // Always clear required if hidden; only set required when visible and not converted
      if (shouldHide) {
        $engine.prop("required", false);
      } else if (!isConverted) {
        $engine.prop("required", true);
      }
    };

    const runAntiTheft = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();

      const $code = $(`#Vehicle_MI${mi}_AntiTheftCode`);
      const $value = $(`#Vehicle_MI${mi}_AntiTheftValue`);
      const $options = $value.find("option");
      const $q = $value.closest(".instanda-question-item");

      const inceptionDateObj = parseInstandaDate(
        Instanda.Variables.InceptionDate_DATE
      );
      const cutoff = new Date(2019, 4, 1); // May 1, 2019
      const hasValidInceptionDate = !Number.isNaN(inceptionDateObj.getTime());

      const st = Instanda.Variables.PremiumState_CHOICE; // full state name (e.g., "Texas")
      const rating = Instanda.Variables.RatingStructure1_TXT;

      const allTypesStates = [
        "Alabama",
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District Of Columbia",
        "Florida",
        "Georgia",
        "Hawaii",
        "Idaho",
        "Illinois",
        "Indiana",
        "Iowa",
        "Kansas",
        "Kentucky",
        "Louisiana",
        "Maine",
        "Maryland",
        "Michigan",
        "Minnesota",
        "Mississippi",
        "Missouri",
        "Montana",
        "Nebraska",
        "Nevada",
        "New Hampshire",
        "New Jersey",
        "New Mexico",
        "New York",
        "North Carolina",
        "North Dakota",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "South Dakota",
        "Tennessee",
        "Texas",
        "Utah",
        "Vermont",
        "Virginia",
        "Washington",
        "West Virginia",
        "Wisconsin",
        "Wyoming",
      ];

      // Collector vehicles: Anti-theft should be shown ONLY in these 5 states (and nowhere else)
      const collectorAllowedStates = [
        "Texas",
        "New York",
        "South Carolina",
        "Pennsylvania",
        "Florida",
      ];
      const collectorTypes = [
        "Collector - Antique",
        "Collector - Classic",
        "Collector - Exotic",
      ];

      // For these states, anti-theft is applicable ONLY to these vehicle types (non-collector rule)
      const restrictedNonCollectorStates = [
        "Texas",
        "New York",
        "South Carolina",
        "Pennsylvania",
      ];
      const restrictedTypes = [
        "Regular",
        "Misc. - All Terrain Vehicle",
        "Misc. - Low Speed Vehicle",
        "Misc. - Moped",
        "Misc. - Motorcycle",
        "Misc. - Motor Home",
        "Misc. - Other Registered Vehicle",
        "Misc. - Other Trailer",
        "Misc. - Recreational Trailer",
        "Misc. - Registered Dune Buggy",
        "Misc. - Registered Golf Cart",
        "Misc. - Snowmobile",
        "Misc. - Unregistered Dune Buggy",
        "Misc. - Unregistered Golf Cart",
        "Misc. - Other Unregistered Vehicle",
      ];

      const isCollector = collectorTypes.includes(type);

      const show = isCollector ?
        collectorAllowedStates.includes(st) :
        restrictedNonCollectorStates.includes(st) ?
        restrictedTypes.includes(type) :
        allTypesStates.includes(st);

      // NY date-based filtering
      const isNYGLM =
        st === "New York" &&
        hasValidInceptionDate &&
        inceptionDateObj >= cutoff;
      const isNYORG =
        st === "New York" && hasValidInceptionDate && inceptionDateObj < cutoff;

      // NY GLM allowed (includes NONE)
      const glmAllowed = [
        "ACTIVE DISABLING OR ALARM-ONLY",
        "ELECTRONIC HOMING DEVICE",
        "NONE",
        "PASSIVE DISABLING",
      ];

      // NY ORG should ALSO allow NONE, so only hide the GLM-exclusive values
      const orgDisallowed = [
        "ACTIVE DISABLING OR ALARM-ONLY",
        "ELECTRONIC HOMING DEVICE",
        "PASSIVE DISABLING",
      ];

      function resetOptionVisibility() {
        $options.each(function () {
          $(this).show();
          $(this).prop("hidden", false);
          $(this).prop("disabled", false);
        });
      }

      function filterNYGLMOptions() {
        $options.each(function () {
          if (!glmAllowed.includes($(this).val())) $(this).hide();
        });
      }

      function filterNYORGOptions() {
        $options.each(function () {
          if (orgDisallowed.includes($(this).val())) $(this).hide();
        });
      }

      // Keep code field hidden (your existing UX)
      $code.hide();

      if (!show) {
        $code.val("").change();
        $value.val("").change();

        $value.prop("required", false);
        $value.hide();
        $q.hide();

        resetOptionVisibility();
        return;
      }

      // Applicable: show question + dropdown
      $q.show();
      $value.show();
      $value.prop("required", true);

      if (!$code.val()) $code.val("XX").change();

      resetOptionVisibility();

      if (isNYGLM) {
        if (!glmAllowed.includes($value.val())) $value.val("").change();
        filterNYGLMOptions();
      } else if (isNYORG) {
        // Only clear if they picked a GLM-exclusive value (NONE remains valid)
        if (orgDisallowed.includes($value.val())) $value.val("").change();
        filterNYORGOptions();
      }

      $code.hide();
    };

    const runPassiveRestraints = (mi) => {
      const $value = $(`#Vehicle_MI${mi}_PassiveRestraintsValue`);
      const $code = $(`#Vehicle_MI${mi}_PassiveRestraintsCode`);

      // Re-entry guard (prevents "my selection got immediately undone")
      if ($value.data("prBusy")) return;
      $value.data("prBusy", true);

      try {
        const state = Instanda?.Variables?.PremiumState_CHOICE;
        const productVersion = Instanda?.Variables?.RatingStructure1_TXT;

        const inceptionDateObj = parseInstandaDate(
          Instanda?.Variables?.InceptionDate_DATE
        );
        const cutoff = new Date(2019, 4, 1);
        const hasValidInceptionDate =
          inceptionDateObj instanceof Date &&
          !Number.isNaN(inceptionDateObj.getTime());

        const isNY = state === "New York";
        const isGLM25 = productVersion === "GLM 2.5";
        const isNYGLM =
          isNY &&
          (isGLM25 || (hasValidInceptionDate && inceptionDateObj >= cutoff));
        const isNYORG =
          isNY &&
          !isNYGLM &&
          hasValidInceptionDate &&
          inceptionDateObj < cutoff;

        const glmAllowed = [
          "DRIVER AND PASSENGER SIDE",
          "DRIVER SIDE ONLY",
          "NONE",
        ];
        const orgDisallowed = ["DRIVER AND PASSENGER SIDE", "DRIVER SIDE ONLY", "NONE"];

        // Set code without firing change events (avoid cascading resets mid-selection)
        if ($code.val() !== "XX") $code.val("XX").change();
        $code.hide();

        const $options = $value.find("option");

        // Reset first
        $options.each(function () {
          $(this).prop("disabled", false).prop("hidden", false);
        });

        // Apply rules using disabled/hidden (more reliable than .hide())
        if (isNYGLM) {
          $options.each(function () {
            const v = $(this).val();
            if (v && !glmAllowed.includes(v))
              $(this).prop("disabled", true).prop("hidden", true);
          });
          if ($value.val() && !glmAllowed.includes($value.val()))
            $value.val("");
        } else if (isNYORG) {
          $options.each(function () {
            const v = $(this).val();
            if (v && orgDisallowed.includes(v))
              $(this).prop("disabled", true).prop("hidden", true);
          });
          if ($value.val() && orgDisallowed.includes($value.val()))
            $value.val("");
        }

        // If selected option is now disabled, fall back to blank (or pick first enabled)
        if ($value.find("option:selected").prop("disabled")) $value.val("");
      } finally {
        $value.data("prBusy", false);
      }
    };

    const runAntilock = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const inceptionDateObj = parseInstandaDate(
        Instanda.Variables.InceptionDate_DATE
      );
      const cutoff = new Date(2019, 4, 1); // May 1, 2019
      const hasValidInceptionDate = !Number.isNaN(inceptionDateObj.getTime());
      const state = Instanda.Variables.PremiumState_CHOICE;
      const $q = $(`#Vehicle_MI${mi}_AntiLock_CHOICE`).closest(
        ".instanda-question-item"
      );
      let show = true;
      if (state === "North Carolina" && type === "Collector - Antique")
        show = false;
      if (
        ["Pennsylvania", "Texas", "Florida", "South Carolina"].includes(state)
      )
        show = false;
      if (
        ["New York"].includes(state) &&
        hasValidInceptionDate &&
        inceptionDateObj >= cutoff
      )
        show = false;

      if (
        state === "California" &&
        !["Regular", "Reg Dune Buggy", "Motor Home"].includes(type)
      )
        show = false;
      if (
        !["Texas", "North Carolina", "California"].includes(state) && [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
        ].includes(type)
      )
        show = false;

      $q.toggle(show);
      $(`#Vehicle_MI${mi}_AntiLock_CHOICE`).prop("required", show);
    };

    const runCostNewMandatory = (mi) => {
      const state = Instanda.Variables.PremiumState_CHOICE;
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const year = parseInt($(`#Vehicle_MI${mi}_ModYear_NUM`).val()) || 9999;
      const comp = $(`#Vehicle_MI${mi}_ComprehensiveSym_NUM`).val();
      const coll = $(`#Vehicle_MI${mi}_CollisionSym_NUM`).val();
      const $field = $(`#Vehicle_MI${mi}_CostNew_NUM`);
      $("#question481016 label .required-asterisk").remove();

      let required = false;
      if (
        [
          "South Carolina",
          "Delaware",
          "Mississippi",
          "Pennsylvania",
          "District Of Columbia",
          "North Dakota",
          "Nebraska",
          "South Dakota",
          "Maine",
          "Iowa",
          "North Carolina",
          "West Virginia",
          "Alaska",
          "Vermont",
          "New Mexico",
        ].includes(state) &&
        year < 2011 &&
        (comp === "27" || coll === "27")
      )
        required = true;
      if (
        [
          "South Carolina",
          "Delaware",
          "Mississippi",
          "Pennsylvania",
          "District Of Columbia",
          "North Dakota",
          "Nebraska",
          "South Dakota",
          "Maine",
          "Iowa",
          "North Carolina",
          "West Virginia",
          "Alaska",
          "Vermont",
          "New Mexico",
          "New York",
        ].includes(state) &&
        year > 2010 &&
        (comp === "98" || coll === "98")
      )
        required = true;
      if (["Hawaii"].includes(state) && (comp === "27" || coll === "27"))
        required = true;
      if (!["North Carolina"].includes(state) && type === "Misc. - Motorcycle")
        required = true;
      if (
        ["Misc. - Snowmobile", "Misc. - All Terrain Vehicle"].includes(type) &&
        ![
          "North Carolina",
          "Pennsylvania",
          "Texas",
          "New York",
          "South Carolina",
          "Hawaii",
          "Delaware",
          "Mississippi",
          "District Of Columbia",
          "North Dakota",
          "Nebraska",
          "South Dakota",
          "Maine",
          "Iowa",
          "West Virginia",
          "Alaska",
          "Vermont",
          "New Mexico",
          "New York",
        ].includes(state)
      )
        required = true;

      $field.prop("required", required);
      if (required)
        $("#question481016 label").append(
          '<span class="required-asterisk" style="color:red;font-size:16px;">*</span>'
        );
    };

    const runSafetyFeatures = (mi) => {
      try {
        const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
        const state = Instanda.Variables.PremiumState_CHOICE;
        const fields = [
          "LaneDepartMonitor",
          "DriverAlertSys",
          "BlindSpotMonitor",
          "AutoBraking",
        ];
        const show = ["Regular", "Motor Home"].includes(type) ||
          (state === "New Jersey" && type && type.includes("Motorcycle"));

        fields.forEach((f) => {
          const $q = $(`input[name="${f}_YN__24354__${mi}"]`).closest(
            ".instanda-question-item"
          );
          $q.toggle(show);
          $(`input[name="${f}_YN__24354__${mi}"]`).prop("required", show);
        });
      } catch (e) {
        console.log(e)
      }
    };

    const runEVHEVQuestions = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;

      if (state === "New Jersey" && type === "Regular") {
        $(`#Vehicle_MI${mi}_ElectricVeh_YNYes`)
          .closest(".instanda-question-item")
          .show();
      } else if (state === "New Jersey") {
        $(`#Vehicle_MI${mi}_ElectricVeh_YNYes`)
          .closest(".instanda-question-item")
          .hide();
      }

      const HYBRID_STATES = new Set([
        "Alaska",
        "Arizona",
        "Arkansas",
        "California",
        "Colorado",
        "Connecticut",
        "Delaware",
        "District Of Columbia",
        "Florida",
        "Idaho",
        "Illinois",
        "Indiana",
        "Kansas",
        "Kentucky",
        "Maine",
        "Maryland",
        "Michigan",
        "Minnesota",
        "Missouri",
        "Montana",
        "Nevada",
        "New Hampshire",
        "New Mexico",
        "New York",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "Texas",
        "Utah",
        "Virginia",
        "Vermont",
        "Washington",
        "Wisconsin",
        "Wyoming",
      ]);

      const showHybrid =
        HYBRID_STATES.has((state ?? "").trim()) && (type ?? "") === "Regular";

      const $hybrid = $(
        `input[name="RegHybridElecVeh_YN__24354__${mi}"]`
      ).closest(".instanda-question-item");

      $hybrid.toggle(!!showHybrid);
    };

    const setupVinStyleDropdown = (mi) => {
      if (Instanda.Variables.ConvertedPolicy_YN !== "Yes") {
        const valueOf = (key) => $(`#Vehicle_MI${mi}_${key}`).val(),
          elementOf = (key) => $(`#Vehicle_MI${mi}_${key}`),
          BodyStyleValue = valueOf("BodyStyle_TXT"),
          ModelValue = valueOf("Model_TXT"),
          VinStyleValueElement = elementOf("VinStyle_TXT"),
          VinStyleQuestionElement = VinStyleValueElement.closest(
            ".instanda-question-item"
          ),
          BodyStyleDescValue = valueOf("BodyStyleDesc_TXT"),
          BodyStyleDescValueElement = elementOf("BodyStyleDesc_TXT"),
          ModelIntegValue = valueOf("ModelInteg_TXT"),
          ModelIntegElement = elementOf("ModelInteg_TXT"),
          vehicleTypeValueElement = elementOf("VehType_CHOICEP"),
          VinStyleFormatElement = elementOf("VinStyleFormat_TXT");

        const formatVinStyles = (desc, model) => {
          if (!model) return "";
          const variants = model.split("/").map((v) => v.trim());
          const modelRoot = variants[0].split(" ")[0];
          return variants.length > 1 ?
            variants
            .map(
              (v) =>
              `${desc} ${v.startsWith(modelRoot) ? v : modelRoot + " " + v
                  }`
            )
            .join("\n") :
            `${desc} ${model}`;
        };

        // Preserve existing VinStyle selection; do not overwrite it
        const existingVinStyle = (VinStyleValueElement.val() || "").trim();

        let vinStyles =
          BodyStyleDescValue || ModelIntegValue ?
          formatVinStyles(BodyStyleDescValue, ModelIntegValue) :
          formatVinStyles(BodyStyleValue, ModelValue);

        if (
          BodyStyleValue === "Named Non-Owned" ||
          ModelValue === "Named Non-Owned"
        ) {
          ModelIntegElement.val("");
          BodyStyleDescValueElement.val("");
        }

        // Compute pipes, but DO NOT clobber VinStyleFormat if compute is empty (e.g., on return)
        let computedPipe = (vinStyles || "")
          .replace(/(\r\n|\n|\r)/g, "|")
          .trim();

        if (computedPipe) {
          VinStyleFormatElement.val(computedPipe);
        }

        const vinStylesPipe = (
          computedPipe ||
          VinStyleFormatElement.val() ||
          ""
        ).trim();

        let vinArray = vinStylesPipe
          .split("|")
          .map((s) => s.trim())
          .filter(Boolean);

        // Keep the existing value valid/visible even if not in the recomputed list
        if (existingVinStyle && !vinArray.includes(existingVinStyle)) {
          vinArray = [existingVinStyle, ...vinArray];
        }

        // Only auto-fill when empty and there is exactly one option
        if (!existingVinStyle && vinArray.length === 1) {
          VinStyleValueElement.val(vinArray[0]);
        }

        // Show field; required only when Regular + multiple choices
        const vehicleType = vehicleTypeValueElement.val();
        const shouldRequire = ["Regular"].includes(vehicleType) && vinArray.length > 1;

        VinStyleQuestionElement.show();
        VinStyleValueElement.prop("required", shouldRequire);

        // Always (re)bind dropdown options so user can click and change selection
        document
          .querySelectorAll(
            ".instanda-well .prefill-vinstyles .instanda-question-input"
          )
          .forEach((row) => {
            const input = row.querySelector("input");
            if (input) bindWithoutDuplicateDropdown(input, vinArray, (d) => d);
          });
      }
    };

    // === VEHICLE DISPLAY RULES ===
    const runRepairOrReplacement = (mi) => {
      const state = Instanda.Variables.PremiumState_CHOICE;
      const no = $(
        `label:has(#Vehicle_MI${mi}_ExtendNonOwnVehReg_YNNo)`
      ).hasClass("instanda-selected");
      const namedNonOwn = Instanda.Variables.NamedNonOwnPol_YN === "No";
      const $q = $(`#Vehicle_MI${mi}_RepairOrReplacement_CHOICE`).closest(
        ".instanda-question-item"
      );
      $q.toggle(state === "North Carolina" && no && namedNonOwn);
    };

    const runHistoricalVehicle = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const $q = $(`#Vehicle_MI${mi}_HistoricalVehicle_YNYes`).closest(
        ".instanda-question-item"
      );
      const show =
        ((state === "New York" || state === "New Jersey") && [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
        ].includes(type)) ||
        (state === "Michigan" && [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
          "Misc. - Electric Auto",
          "Misc. - Golf Cart",
          "Misc. - Motorcycle",
          "Regular",
          "Reg Dune Buggy",
          "Motor Home",
        ].includes(type));
      $q.toggle(show).find("input").prop("required", show);
    };

    const runPassengerHazardExclusion = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const $q = $(`#Vehicle_MI${mi}_PassengerHazardExclusion_YNYes`).closest(
        ".instanda-question-item"
      );
      const risky = [
        "Misc. - Registered Dune Buggy",
        "Misc. - Snowmobile",
        "Misc. - Nonreg. Dune Buggy",
        "Misc. - All Terrain Vehicle",
        "Misc. - Motorcycle",
      ];
      const show =
        risky.includes(type) && [
          "Alabama",
          "Arizona",
          "California",
          "Connecticut",
          "Florida",
          "Idaho",
          "Illinois",
          "Louisiana",
          "Massachusetts",
          "Minnesota",
          "Montana",
          "North Dakota",
          "Oregon",
          "South Dakota",
          "Tennessee",
          "Utah",
          "Wyoming",
          "Alaska",
          "Nebraska",
          "New Mexico",
          "Nevada",
          "Colorado",
          "Delaware",
          "Georgia",
          "Hawaii",
          "Iowa",
          "Indiana",
          "Kansas",
          "Michigan",
          "Missouri",
          "Mississippi",
          "Rhode Island",
          "Wisconsin",
        ].includes(state);
      $q.toggle(show).find("input").prop("required", show);
    };

    const runCarfaxOverrides = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const isStaff = Instanda.Variables.SalespersonReferralLevel;
      const regular = ["Regular", "Reg Dune Buggy", "Motor Home"].includes(
        type
      );

      const $annMil = $(
        `input[name="OverrideAvgAnnMileage_YNP__24354__${mi}"]`
      ).closest(".instanda-question-item");
      const $firstDmg = $(
        `input[name="OverrideFirPotenDamage_YNP__24354__${mi}"]`
      ).closest(".instanda-question-item");
      const $title = $(
        `input[name="OverrideNoOfTitleTransfer_YNP__24354__${mi}"]`
      ).closest(".instanda-question-item");

      if (isStaff < 4) {
        [$annMil, $firstDmg, $title].forEach(($el) =>
          $el.hide().find("input").prop("required", false)
        );
      } else if (regular) {
        const show = [
          "Alabama",
          "Arizona",
          "Arkansas",
          "Colorado",
          "Connecticut",
          "Florida",
          "Georgia",
          "Idaho",
          "Illinois",
          "Indiana",
          "Kansas",
          "Kentucky",
          "Minnesota",
          "Missouri",
          "Montana",
          "New Hampshire",
          "New Jersey",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Rhode Island",
          "Tennessee",
          "Texas",
          "Utah",
          "Washington",
          "Wisconsin",
          "Wyoming",
          "South Carolina",
          "California",
          "Louisiana",
          "Virginia",
          "Maryland",
          "Michigan",
          "New York",
          "Iowa",
          "Pennsylvania",
        ].includes(state);
        $annMil.toggle(show || ["Pennsylvania", "Iowa"].includes(state));
        $firstDmg.toggle(show || state === "Pennsylvania");
        $title.toggle(show);
        $annMil
          .find("input")
          .add($firstDmg.find("input"))
          .add($title.find("input"))
          .prop("required", show);
      }
    };

    /* const runAgreedValue = (mi) => {
       const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
       const state = Instanda.Variables.PremiumState_CHOICE;
       const policyType = Instanda.Variables.PolicyType_CHOICE;
       const $q = $(`#Vehicle_MI${mi}_AgreedVal_NUM`).closest(
         ".instanda-question-item"
       );
       const states = [
         "Florida",
         "Illinois",
         "Arizona",
         "New Jersey",
         "New York",
         "Colorado",
         "Connecticut",
         "Pennsylvania",
         "Maryland",
         "Missouri",
         "Louisiana",
         "Texas",
         "Michigan",
         "Virginia",
         "Tennessee",
         "Iowa",
         "District Of Columbia",
         "Georgia",
         "Kentucky",
         "Oklahoma",
         "Wisconsin",
         "Ohio",
         "Indiana",
         "California",
         "South Carolina",
         "Utah",
         "Washington",
         "Arkansas",
         "Montana",
         "Rhode Island",
         "Oregon",
         "Nevada",
         "Minnesota",
         "Idaho",
         "New Hampshire",
         "Wyoming",
         "Alabama",
       ];
   
       if (
         states.includes(state) &&
         policyType === "CORE COVERAGE" &&
         type === "Regular"
       ) {
         $q.hide().find("input").prop("required", false);
       } else if (states.includes(state)) {
         $q.show().find("input").prop("required", true);
       }
     };*/

    const runDefaultMarketValue = (mi) => {
      const $agreed = $(`#Vehicle_MI${mi}_AgreedVal_NUM`);
      const $market = $(`#Vehicle_MI${mi}_MarketVal_NUM`);
      const $original = $(`#Vehicle_MI${mi}_OriginalAgreedVal_NUM`);

      function sanitizeNumberInput(val) {
        // Removes all non-numeric and non-dot (for decimals) characters
        return val ? val.replace(/[^0-9.]/g, "") : "";
      }

      function updateMarketAndOriginal() {
        const agreedValRaw = $agreed.val();
        const agreedValClean = sanitizeNumberInput(agreedValRaw);

        if (agreedValClean && !isNaN(agreedValClean)) {
          if (!$market.val()) {
            $market.val(agreedValClean);
            if (
              Instanda.Variables.ConvertedPolicy_YN !== "Yes" &&
              Instanda?.Variables?.SalespersonReferralLevel < 4
            )
              //BH-27263
              $market.css({
                "pointer-events": "none",
                "background-color": "#eee",
                cursor: "not-allowed",
              });
            // $('#question481058 input').attr('readonly', true)
            //$('#question481058').removeClass('readonly')
          }
          if (!$original.val()) {
            $original.val(agreedValClean);
          }
        }
      }

      // Listen for user completing input (lose focus or press enter)
      $agreed
        .off("change.market blur.market")
        .on("change.market blur.market", updateMarketAndOriginal);
    };

    const runDaytimeRunningLights = (mi) => {
      const type = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const $q = $(
        `input[name="DaytimeRunningLights_YN__24354__${mi}"]`
      ).closest(".instanda-question-item");
      if (
        state === "New York" && ["Regular", "Reg Dune Buggy", "Motor Home"].includes(type)
      ) {
        $q.show().find("input").prop("required", true);
      } else if (state === "New York") {
        $q.hide().find("input").prop("required", false);
      }
    };

    function excludeVehiclefromPrincipalAssn(miContainer) {
      const id = miContainer.id;
      const pattern = id.match(/^Vehicle_MI(\d+)_PrincipalDriver_TXT$/);
      const miNum = pattern[1];
      console.log(
        document.querySelector(`#Vehicle_MI${miNum}_PrincipalDriver_TXT`)
      );
      if (document.querySelector(`#Vehicle_MI${miNum}_PrincipalDriver_TXT`)) {
        const excludedVehList = document.querySelector(
          "#ExcludePrincipalDriversforVehInd_TXT"
        );
        const newList = excludedVehList.value + " " + miNum;
        excludedVehList.value = newList;
      }
    }

    function checkVehicleExclusedfromPrinAss(miNum) {
      const excludedVehListTxt = document.querySelector(
        "#ExcludePrincipalDriversforVehInd_TXT"
      ).value;
      const excludedVehList = excludedVehListTxt.split(" ");
      return excludedVehList.includes(miNum);
    }

    function attachVehExclusion() {
      document
        .querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]')
        .forEach((mi) => {
          setTimeout(() => {
            const attr = mi.id;
            const pattern = attr.match(/^Vehicle_MI(\d+)$/);
            const miNum = pattern[1];
            if (
              document.querySelector(`#Vehicle_MI${miNum}_VehType_CHOICEP`)
              .value === "Regular"
            ) {
              console.log("assigning to ", miNum);
              document
                .querySelector(`#Vehicle_MI${miNum}_PrincipalDriver_TXT`)
                .addEventListener("change", () => {
                  excludeVehiclefromPrincipalAssn(
                    document.querySelector(
                      `#Vehicle_MI${miNum}_PrincipalDriver_TXT`
                    )
                  );
                });
            }
          }, 100);
        });
    }

    // === PRINCIPAL DRIVER AUTO-ASSIGN ONLY (NO occasional) ===
    const assignPrincipalDriversOnly = () => {
      if (!driversList.length) return;

      const regularRated = [];

      for (let i = 0; i < vehicleContainers.length; i++) {
        const container = vehicleContainers[i];
        const mi = getMINumber(container);
        if (!mi) continue;

        if (checkVehicleExclusedfromPrinAss(mi)) {
          console.log("skipping", mi);
          continue;
        }

        const typeEl = container.querySelector(
          `#Vehicle_MI${mi}_VehType_CHOICEP`
        );
        const noRadio = container.querySelector(
          `#Vehicle_MI${mi}_ExtendNonOwnVehReg_YNNo`
        );
        const useEl = container.querySelector(`#Vehicle_MI${mi}_VehUse_CHOICE`);
        const principalEl = container.querySelector(
          `#Vehicle_MI${mi}_PrincipalDriver_TXT`
        );

        if (!typeEl || !principalEl) continue;

        const type = typeEl.value;
        const use = useEl?.value || "";
        const isRegularRated =
          (type === "Regular" && noRadio?.checked) || ["Misc. - Registered Dune Buggy", "Reg Dune Buggy"].includes(type) ||
          (["Misc. - Motor Home", "Motor Home"].includes(type) && ["Business", "To/From Work/School"].includes(use));

        if (type === "Misc. - Motorcycle") {
          principalEl.value = driversList[0] || "";
        } else if (isRegularRated) {
          regularRated.push(principalEl);
        }
      }

      regularRated.forEach((el, i) => {
        if (driversList[i]) el.value = driversList[i];
      });
    };

    // === MAIN PROCESSING ===
    const processAllVehicles = () => {
      updateDriversList();
      vehicleContainers = Array.from(
        document.querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]')
      );

      vehicleContainers.forEach((container) => {
        const mi = getMINumber(container);
        if (mi && !processedVehicles.has(mi)) {
          processedVehicles.add(mi);
          runAllRules(mi);
        }
      });

      // assignPrincipalDriversOnly();
      // attachVehExclusion();
    };

    // === ULTRA-FAST CHANGE DETECTION ===
    let timer = null;
    const debouncedProcess = () => {
      clearTimeout(timer);
      timer = setTimeout(processAllVehicles, 80);
    };

    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          [...m.addedNodes].some(
            (n) =>
            n.nodeType === 1 &&
            n.matches?.('[class*="instanda-multi-item-Vehicle_MI"]')
          )
        ) {
          debouncedProcess();
          break;
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const relevantSuffixes = [
      "_VehType_CHOICEP",
      "_VehUse_CHOICE",
      "_ExtendNonOwnVehReg_YNYes",
      "_ExtendNonOwnVehReg_YNNo",
      "_CostNew_NUM",
      "_AntiTheftCode",
      "_AntiTheftValue",
      "_PassiveRestraintsCode",
      "_PassiveRestraintsValue",
      "_ModYear_NUM",
      "_ComprehensiveSym_NUM",
      "_CollisionSym_NUM",
      // Add more as your logic needs—just match the end part of IDs that, for that MI, when changed, need rule adjustment.
    ];
    // Dynamically build a selector for all relevant fields
    const fieldSelector = relevantSuffixes
      .map((sf) => `[id^="Vehicle_MI"][id$="${sf}"]`)
      .join(",");

    $(document).on("change.ultra100", fieldSelector, function () {
      const match = this.id.match(/Vehicle_MI(\d+)_/);
      if (match) {
        const mi = match[1];
        runAllRules(mi);
      }
    });

    $(document)
      .off(".ultra100")
      .on(
        "change.ultra100 input.ultra100",
        '[id^="Vehicle_MI"]',
        debouncedProcess
      )
      .on("click.ultra100", "#Vehicle_MIaddButton", () =>
        setTimeout(debouncedProcess, 300)
      );

    // Initial run
    processAllVehicles();

    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_VehType_CHOICEP"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_VehType_CHOICEP/);
        if (idMatch) {
          const mi = idMatch[1];
          runAllRules(mi); // re-run all rules for the changed vehicle
        }
      }
    ); ///
    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_CostNew_NUM"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_CostNew_NUM/);
        if (idMatch) {
          const mi = idMatch[1];
          runComprehensiveSymbol(mi); // re-run all rules for the changed vehicle
        }
      }
    );
    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_BodyStyle_TXT"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_BodyStyle_TXT/);
        if (idMatch) {
          const mi = idMatch[1];
          setupVinStyleDropdown(mi); // re-run all rules for the changed body style
        }
      }
    );
    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_Model_TXT"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_Model_TXT/);
        if (idMatch) {
          const mi = idMatch[1];
          setupVinStyleDropdown(mi); // re-run all rules for the changed model
        }
      }
    );
    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_ModelInteg_TXT"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_ModelInteg_TXT/);
        if (idMatch) {
          const mi = idMatch[1];
          setupVinStyleDropdown(mi); // re-run all rules for the changed model integ
        }
      }
    );
    $(document).on(
      "change",
      '[id^="Vehicle_MI"][id$="_BodyStyleDesc_TXT"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_BodyStyleDesc_TXT/);
        if (idMatch) {
          const mi = idMatch[1];
          setupVinStyleDropdown(mi); // re-run all rules for the changed body
        }
      }
    );
    $(document).on(
      "click",
      '[id^="Vehicle_MI"][id$="_PassiveRestraintsValue"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_PassiveRestraintsValue/);
        if (idMatch) {
          const mi = idMatch[1];
          runPassiveRestraints(mi); // re-run PassiveRestraint
        }
      }
    );
    $(document).on(
      "click",
      '[id^="Vehicle_MI"][id$="_AntiTheftValue"]',
      function () {
        const idMatch = this.id.match(/Vehicle_MI(\d+)_AntiTheftValue/);
        if (idMatch) {
          const mi = idMatch[1];
          runAntiTheft(mi); // re-run AntiTheft
        }
      }
    );
  });

  /////////////////////////////////////////Vehicle Stored Masonry
  //Code to hide stored masonry when garaged location is No inside MI
  //Auto
  if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
    function HideMasonryMI() {
      const parentContainer = document.querySelectorAll(
        '[class*="instanda-multi-item-Vehicle_MI"]'
      );
      const prefix = "instanda-multi-item-Vehicle_MI";

      parentContainer.forEach((parent) => {
        const addVehicleMI = extractMINumber(parent, prefix);
        GaragedMIY = $(
          `label:has(#Vehicle_MI${addVehicleMI}_GaragedAtSecLocationMI_YNYes)`
        );
        GaragedMIN = $(
          `label:has(#Vehicle_MI${addVehicleMI}_GaragedAtSecLocationMI_YNNo)`
        );

        storedMIY = $(
          `label:has(#Vehicle_MI${addVehicleMI}_StoredInMasonryStructureMI_YNYes)`
        );
        storedMIN = $(
          `label:has(#Vehicle_MI${addVehicleMI}_StoredInMasonryStructureMI_YNNo)`
        );

        if (
          GaragedMIY.hasClass("instanda-selected") &&
          GaragedMIN.hasClass("instanda-unselected")
        ) {
          $(".storedMasonry").removeClass("hidden");
          $(".storedMasonry input").prop("required", true);
        } else {
          $(".storedMasonry").addClass("hidden");
          storedMIN.trigger("click");
          storedMIN
            .addClass("instanda-selected")
            .removeClass("instanda-unselected");
          $(".storedMasonry input").prop("required", false);
        }
      });
    }
    safeRun(() => HideMasonryMI());
    $(document).on("change", '.garaged input[type="radio"]', function () {
      safeRun(() => HideMasonryMI());
    });
  }

  //Code to hide stored masonry when garaged location is No outside MI
  //Auto
  if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
    function HideMasonryCM() {
      GaragedY = $(`label:has(#GaragedAtSecLocationCm_YNYes)`);
      GaragedN = $(`label:has(#GaragedAtSecLocationCm_YNNo)`);

      storedY = $(`label:has(#StoredInMasonryStructureCm_YNYes)`);
      storedN = $(`label:has(#StoredInMasonryStructureCm_YNNo)`);
      if (
        GaragedY.hasClass("instanda-selected") &&
        GaragedN.hasClass("instanda-unselected")
      ) {
        $(".storedMasonryCM").removeClass("hidden");
        $(".storedMasonryCM input").prop("required", true);
      } else {
        $(".storedMasonryCM").addClass("hidden");
        storedN.trigger("click");
        storedN
          .addClass("instanda-selected")
          .removeClass("instanda-unselected");
        $(".storedMasonryCM input").prop("required", false);
      }
    }
    safeRun(() => HideMasonryCM());
    GaragedY.on("change", function () {
      safeRun(() => HideMasonryCM());
    });
    GaragedN.on("change", function () {
      safeRun(() => HideMasonryCM());
    });
  }

  ///////////////////////////////////////////// Vehicle Screen Avarage Annual Miles Warning Msg /////////////////////////////////////////////
  //Auto improved for Performance
  if (
    document.querySelector(
      ".page-quickquotequestions.page-number-4.package-24338"
    )
  ) {
    const VALID_STATES = new Set([
      "Alabama",
      "Arizona",
      "Arkansas",
      "Colorado",
      "Connecticut",
      "Florida",
      "Georgia",
      "Idaho",
      "Illinois",
      "Indiana",
      "Kansas",
      "Kentucky",
      "Louisiana",
      "Maryland",
      "Michigan",
      "Minnesota",
      "Missouri",
      "Montana",
      "New Hampshire",
      "New Jersey",
      "New York",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Rhode Island",
      "Tennessee",
      "Texas",
      "Utah",
      "Virginia",
      "Washington",
      "Wisconsin",
      "Wyoming",
      "South Carolina",
      "Iowa",
      "Pennsylvania",
    ]);

    const VALID_VEH_TYPES = new Set([
      "Regular",
      "Reg Dune Buggy",
      "Misc. - Motor Home",
    ]);
    const BUSINESS_USE = new Set(["Business", "To/From Work/School"]);

    let lastAlertKey = ""; // Prevents spam alerts

    const checkAndWarn = (mi) => {
      if (!VALID_STATES.has(Instanda.Variables.PremiumState_CHOICE)) return;
      if (
        !["NewBusiness", "MTA", "Renewal"].includes(
          Instanda.Variables.CreatedFrom
        )
      )
        return;

      const vehType = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const usage = $(`#Vehicle_MI${mi}_VehUse_CHOICE`).val();
      const milesRaw = $(`#Vehicle_MI${mi}_AvgAnnualMiles_NUM`).val();
      const miles = milesRaw ? Number(milesRaw.replace(/,/g, "")) : null;

      if (!VALID_VEH_TYPES.has(vehType)) return;
      if (!BUSINESS_USE.has(usage)) return;
      if (!miles || miles >= 5001) return;

      // Prevent duplicate alerts for same vehicle
      const currentKey = `MI${mi}_${miles}`;
      if (lastAlertKey === currentKey) return;
      lastAlertKey = currentKey;
      if (
        Instanda.Variables.ConvertedPolicy_YN != "Yes" ||
        Instanda.Variables.ConvertedPolicy_YNP != "Yes"
      ) {
        displayApiWarningMessage("UW Approval Required for miles < 5,001.");
      }
    };

    const warnprocessAllVehicles = () => {
      document
        .querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]')
        .forEach((container) => {
          const match = container.className.match(
            /instanda-multi-item-Vehicle_MI(\d+)/
          );
          if (match) {
            const mi = parseInt(match[1]);
            checkAndWarn(mi);

            // Bind events only once per field
            const $milesInput = $(`#Vehicle_MI${mi}_AvgAnnualMiles_NUM`);
            const $useSelect = $(`#Vehicle_MI${mi}_VehUse_CHOICE`);

            $milesInput
              .off(`input.warn${mi} change.warn${mi}`)
              .on(`input.warn${mi} change.warn${mi}`, () => checkAndWarn(mi));
            $useSelect
              .off(`change.warn${mi}`)
              .on(`change.warn${mi}`, () => checkAndWarn(mi));
          }
        });
    };

    // Run on load
    $(document).ready(warnprocessAllVehicles);

    // Run when adding new vehicle
    $(document).on("click", "#Vehicle_MIaddButton", () =>
      setTimeout(warnprocessAllVehicles, 250)
    );

    // Re-check if vehicle type changes (extra safety)
    $(document).on("change", '[id$="_VehType_CHOICEP"]', () =>
      setTimeout(warnprocessAllVehicles, 100)
    );

    // Watch for dynamically added vehicles
    new MutationObserver((mutations) => {
      if (
        mutations.some((m) => [...m.addedNodes].some(
          (n) =>
          n.nodeType === 1 &&
          n.matches('[class*="instanda-multi-item-Vehicle_MI"]')
        ))
      ) {
        lastAlertKey = ""; // Reset to allow fresh alerts
        setTimeout(warnprocessAllVehicles, 200);
      }
    }).observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Initial run
    warnprocessAllVehicles();
  }


  $(function () {
    if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
      function calculateGaragingFields() {
        const GaragingParentContainers = document.querySelectorAll(
          '[class*="instanda-multi-item-Vehicle_MI"]'
        );
        const Garagingprefix = "instanda-multi-item-Vehicle_MI";

        GaragingParentContainers.forEach((parent) => {
          const addVehicleMI = extractMINumber(parent, Garagingprefix);

          if (
            $(`#Vehicle_MI${addVehicleMI}_ApplyToAll_YNPYes`)
            .parent()
            .hasClass("instanda-selected")
          ) {
            if (
              $(
                `#Vehicle_MI${addVehicleMI}_GaragingLocationMI_CHOICEP`
              ).val() === "Listed Locations"
            ) {
              var addressParts = $(
                  `#Vehicle_MI${addVehicleMI}_ListedGaragingLocation_TXT`
                )
                .val()
                .split(",")
                .map(function (item) {
                  return $.trim(item);
                });

              var [one, two, three, four, five, six] = addressParts;

              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine1`).val(one);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine2`).val(two);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCity`).val(three);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrState`).val(
                getStateName(four)
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCountry`).val(
                getUSorINT(six)
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrPostCode`).val(
                extractZipCode(five)
              );
            } else {
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine1`).val(
                $(`#Vehicle_MI${addVehicleMI}_GaragingAddressLine1MI_TXT`).val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine2`).val(
                $(`#Vehicle_MI${addVehicleMI}_GaragingAddressLine2MI_TXT`).val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCity`).val(
                $(`#Vehicle_MI${addVehicleMI}_GaragingCityMI_TXT`).val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrState`).val(
                getStateName(
                  $(`#Vehicle_MI${addVehicleMI}_GaragingStateMI_TXT`).val()
                )
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrPostCode`).val(
                extractZipCode(
                  $(
                    `#GaragingPostcodeMI_NUM__24354__${addVehicleMI}483440`
                  ).val()
                )
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCountry`).val(
                getUSorINT(
                  $(
                    `#country-selectionGaragingCountryMI_TXT__24354__${addVehicleMI}`
                  ).val()
                )
              );
            }
          } else {
            if ($("#GaragingLocationCm_CHOICEP").val() === "Listed Locations") {
              var addressParts = $("#ExistingGaraging_TXT")
                .val()
                .split(",")
                .map(function (item) {
                  return $.trim(item);
                });

              var [one, two, three, four, five, six] = addressParts;

              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine1`).val(one);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine2`).val(two);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCity`).val(three);
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrState`).val(
                getStateName(four)
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCountry`).val(
                getUSorINT(six)
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrPostCode`).val(
                extractZipCode(five)
              );
            } else {
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine1`).val(
                $("#GaragingAddressLine1Cm_TXT").val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrLine2`).val(
                $("#GaragingAddressLine2Cm_TXT").val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCity`).val(
                $("#GaragingCityCm_TXT").val()
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrState`).val(
                getStateName($("#GaragingStateCm_TXT").val())
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrPostCode`).val(
                extractZipCode($("#GaragingPostcodeCm_TXT483435").val())
              );
              $(`#Vehicle_MI${addVehicleMI}_Coh_GaragingAddrCountry`).val(
                getUSorINT($("#country-selectionGaragingCountryCm_TXT").val())
              );
            }
          }
        });
        console.log("calculated garaging address fields");
      }

      $(".save-instance-button").on("click", function () {
        calculateGaragingFields();
      });
    }
  });

  //////////// Prefill Prior Violation Accident Date with Infraction Date for comparing values on document calculation start
  //Auto
  function prefillPriorViolationAccidentDate() {
    const parentContainers = document.querySelectorAll(
      '[class*="instanda-multi-item-Infraction_MI"]'
    );
    const prefix = "instanda-multi-item-Infraction_MI";

    console.log("the function is called:");

    parentContainers.forEach((parent) => {
      const addVehicleMI = extractMINumber(parent, prefix);
      const infractionDateInput = $(
        `#Infraction_MI${addVehicleMI}_Infraction_ViolationAccident_DATE`
      );
      const priorViolationDateInput = $(
        `#Infraction_MI${addVehicleMI}_Prior_ViolationAccident_DATE`
      );

      console.log("infractionDateInput:", infractionDateInput.val());
      console.log("priorViolationDateInput:", priorViolationDateInput.val());

      if (
        infractionDateInput.val() &&
        Instanda.Variables.CreatedFrom === "NewBusiness"
      ) {
        if (priorViolationDateInput) {
          priorViolationDateInput.val(infractionDateInput.val());
        }
      }
    });
  }
  //Auto
  document.addEventListener("click", function (event) {
    if (!$(".page-quickquotequestions.page-number-3.package-24338").length > 0)
      return;

    const calendarIcon = event.target.closest(".glyphicon-calendar");
    if (calendarIcon) {
      const parentInput = calendarIcon
        .closest(".input-group")
        ?.querySelector('[id$="_Infraction_Conviction_DATE"]');

      if (parentInput) {
        const match = parentInput.id.match(
          /Infraction_MI(\d+)_Infraction_Conviction_DATE/
        );
        if (match) {
          const miNumber = match[1];
          console.log(
            `Calendar icon clicked for Infraction_Conviction_DATE field with MI number: ${miNumber}`
          );
          prefillPriorViolationAccidentDate();
        }
      }
    }
  });
  ////////////// Prefill Prior Violation Accident Date with Infraction Date for comparing values on document calculation start - End

  /////////////////////////////////////taking the control to the page top from garaging address when adding a new vehicle start //////////////////////////////////////////
  //Auto
  function handleFirstClick(e) {
    if (e.target && e.target.id === "Vehicle_MIaddButton") {
      const focusElement = document.getElementById(
        "Vehicle_MI1_VehType_CHOICEP"
      );
      if (focusElement) {
        setTimeout(() => {
          focusElement.focus();
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }, 100);
      }
      // Remove the event listener after the first click
      document.body.removeEventListener("click", handleFirstClick);
    }
  }
  //Auto
  if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
    document.body.addEventListener("click", handleFirstClick);
  }
  /////////////////////////////////////taking the control to the page top from garaging address when adding a new vehicle end//////////////////////////////////////////

  ///////////////////////////////////////////// making the field editable for MTA transactin start

  //Auto
  function removeReadonlyForName() {
    // Ensure we're on the correct page
    if ($(".page-quickquotequestions.page-number-4.package-24338").length === 0)
      return;

    // Get transaction type safely
    const transType = window.Instanda?.Variables?.CreatedFrom;
    if (transType !== "MTA") return;

    // Remove 'readonly' class from all matching elements
    document.querySelectorAll("#question481674").forEach((element) => {
      element.classList.remove("readonly");
    });
  }
  // Run after DOM is fully ready
  //Auto
  $(removeReadonlyForName);

  function getDateLicensedFromMultiItem() {
    if (isReadOnlyView()) return;
    if ($(".page-quickquotequestions.page-number-2.package-24338").length === 0) return;
    const dateLicensed = Array.from(
      document.querySelectorAll(
        'input[id*="Driver_MI"][id$="_MC_DateLicensed_DATE"]'
      )
    );
    const dateLicensedY = Array.from(
      document.querySelectorAll(
        'input[data-newid*="Driver_MI"][data-newid$="MotorcycleLicInfo_YNP"][value="Yes"]'
      )
    ).filter((input) => input.checked);
    return dateLicensed
      .map((item) => {
        const dateLicensedValue = item.value.trim();
        return dateLicensedY ? dateLicensedValue : "";
      })
      .filter((item) => item !== "" && dateLicensedY.length > 0);
  }
  //Auto
  function prefillDateLicensedFromMultiItem() {
    if (isReadOnlyView()) return;
    if ($(".page-quickquotequestions.page-number-2.package-24338").length === 0) return;
    const dateLicensed = getDateLicensedFromMultiItem();
    console.log(dateLicensed);
    $("#StoreDrvLicInfo_TXT").val(dateLicensed.join(", "));
  }
  //Auto
  document.addEventListener("click", function (event) {
    const input = event.target.closest(
      '[id^="Driver_MI"][id$="_MC_DateLicensed_DATE"]'
    );
    const addon = event.target.closest(".input-group-addon");
    if (input || (addon && addon.querySelector(".glyphicon-calendar"))) {
      prefillDateLicensedFromMultiItem();
    }
  });
  //Auto
  $(document).on(
    "change",
    '[data-newid^="Driver_MI"][data-newid$="MotorcycleLicInfo_YNP"]',
    function () {
      prefillDateLicensedFromMultiItem();
    }
  );
  //Auto
  function showWarningMsgForMotorcycle() {
    if ($(".page-quickquotequestions.page-number-4.package-24338").length === 0) return;
    const parentContainer = document.querySelectorAll(
      '[class*="instanda-multi-item-Vehicle_MI"]'
    );
    const prefix = "instanda-multi-item-Vehicle_MI";
    parentContainer.forEach((parent) => {
      const addVehicleMI = extractMINumber(parent, prefix);
      const vehcileScreenVehicleType = $(
        `#Vehicle_MI${addVehicleMI}_VehType_CHOICEP`
      );
      const StoreDrvLicInfo_TXT = Instanda.Variables.StoreDrvLicInfo_TXT;
      const drivers = StoreDrvLicInfo_TXT ? StoreDrvLicInfo_TXT.split(",") : [];
      console.log("drivers", drivers);
      if (
        ["Misc. - Motorcycle"].includes(vehcileScreenVehicleType.val()) &&
        drivers[0] === undefined
      ) {
        $(`#Vehicle_MI${addVehicleMI}_VehType_CHOICEP`)
          .closest('div[data-summary-header="Vehicle_MI_summary"]')
          .find("#question501232")
          .css("display", "block");
      } else {
        $(`#Vehicle_MI${addVehicleMI}_VehType_CHOICEP`)
          .closest('div[data-summary-header="Vehicle_MI_summary"]')
          .find("#question501232")
          .css("display", "none");
        console.log("question501232 hidden");
      }
      //Passive Restraints vvk commented
      // const PassiveRestraintsValueElement = $(`#Vehicle_MI${addVehicleMI}_PassiveRestraintsValue`);
      //const PassiveRestraintsCodeValueElement = $(`#Vehicle_MI${addVehicleMI}_PassiveRestraintsCode`);
      //const PassiveRestraintsQuestionElement = PassiveRestraintsValueElement.closest(".instanda-question-item");
      //console.log('calling passive in showWarningMsgForMotorcycle');
      //PassiveRestraints(vehcileScreenVehicleType,PassiveRestraintsQuestionElement,PassiveRestraintsValueElement);
    });
  }
  showWarningMsgForMotorcycle();
  //Auto
  $('[id^="Vehicle_MI"][id$="_VehType_CHOICEP"]').on("change", function () {
    console.log("showWarningMsgForMotorcycle logged");
    showWarningMsgForMotorcycle();
  });
  /////////////////////////////showing warning message for motorcycle vehicle end

  //Phase 2 coverages screen code
  //Auto
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    function setCoverageType() {
      if (isReadOnlyView()) return;
      var state = Instanda.Variables.PremiumState_CHOICE;
      const policyType = Instanda.Variables.PolicyType_CHOICE;
      //NJ: "If 'Policy Type' (PAF0003) field on 'Insured Info' tab is set to 'Basic' and if the State = NJ, then default the field 'Coverage Type' (PAF0471) to 'Split' and disable it."

      if (state === "New Jersey" && policyType === "BASIC") {
        $("#question482293").addClass("readonly");
        $("#CovTypeValue").val("Split").trigger("change");
        //document.getElementById('CovTypeValue').value = 'Split';
      } else if (state === "Kansas") {
        //KS def to split
        $("#question482293").removeClass("readonly");
        $("#CovTypeValue").val("Split").trigger("change");
      } else {
        $("#question482293").removeClass("readonly");
      }
    }

    $(document).ready(function () {
      setTimeout(() => {
        safeRun(() => setCoverageType());
      }, 500);
    });
  }

  //Show or hide NH field.
  //Auto
  function hideFieldsNH() {
    const fieldsAll = [
      "#question483426", // Pet Coverage
      "#question483387", // Coverage for Personal Property
      "#question483397", // Trip Interruption
      "#question483392", // Vehicle and Home Alteration
      "#question483401", // Roadside Coverage
    ];
    const fieldsCore = fieldsAll.slice(0, 3);
    const $page = $(".page-quickquotequestions.page-number-6.package-24338");
    if ($page.length === 0) return;

    // Hide all relevant fields by default
    fieldsAll.forEach((sel) => $(sel).hide());

    const policyType = Instanda?.Variables?.PolicyType_CHOICE;
    const state =
      Instanda?.Variables?.PremiumState_CHOICE ||
      $("#PremiumState_CHOICE").val();

    if (state === "") return;

    if (policyType === "STANDARD") {
      const regVeh = Instanda?.Variables?.RegularVehCalc_SUM;
      const covType = $("#CovTypeValue").val();
      if (covType === "Single" && regVeh > 0) {
        fieldsAll.forEach((sel) => $(sel).show());
        console.log("if block");
      } else {
        console.log("else block");
        // already hidden by default
      }
    } else if (policyType === "CORE COVERAGE") {
      const regularVeh = Instanda?.Variables?.RegularCalc_SUM;
      const covType = $("#CovTypeValue").val();
      if (covType === "Single" && regularVeh > 0) {
        fieldsCore.forEach((sel) => $(sel).show());
        console.log("if block");
      } else {
        console.log("else block");
        // already hidden by default
      }
    }
  }
  //Auto
  hideFieldsNH();
  //Auto
  $("#question482293").on("change", function () {
    console.log("input changes function called", $("#CovTypeValue").val());
    hideFieldsNH();
  });

  //Show or hide supplemental spousal liability
  //Auto
  function hideSupplementalSpousal() {
    // Check if the page context is correct before proceeding
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var married = Instanda.Variables.SupplementalDriver_SUM;
      var vehicle = Instanda.Variables.SupplementalVeh_SUM;

      if (
        married > 0 &&
        vehicle > 0 &&
        ($("#CovTypeValue").val() === "Single" ||
          $("#CovTypeValue").val() === "Split")
      ) {
        $("#question483290").show();
        $("#SupSpousalLiabilityNY_YN").attr("required", true);
        $("#question483290 input").on("change", () => {
          if ($("#question483290 .instanda-question-yes-no-no.instanda-selected").length > 0) displayApiWarningMessage("Supplemental Spousal Liability coverage is not selected. Declination form should be submitted by the Insured")
        })
      } else {
        $("#question483290").hide();
        $("#SupSpousalLiabilityNY_YN").attr("required", false);
      }
    }
  }

  // Initial execution
  //Auto
  hideSupplementalSpousal();
  //Auto
  $("#question482293").on("change", function () {
    // Check the page context again before running logic
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      console.log("input changes function called", $("#CovTypeValue").val());
      hideSupplementalSpousal();
      defaultBodInjAndPropDamForNC();
      hideUMOnlyOptionForExpiredDate();
    }
  });

  //Added for Vehicle Screen to render and hide garaged at sec location
  //Auto
  function vehicleLogic() {
    if (isReadOnlyView()) return;
    // Ensure logic only runs on the appropriate page context
    if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
      const zipCodeInput = $('input[name="GaragingPostcodeCm_TXT"]');
      console.log(zipCodeInput.val());

      if (zipCodeInput.length > 0) {
        const primaryZip = Instanda.Variables.MA_Zip_NUM;
        console.log(primaryZip);

        var firstLabel = $("label:has(#GaragedAtSecLocationCm_YNYes)");
        var lastLabel = $("label:has(#GaragedAtSecLocationCm_YNNo)");

        if (primaryZip == zipCodeInput.val()) {
          console.log("if block");

          if (firstLabel.hasClass("instanda-selected")) {
            // Unselect 'Yes' and select 'No'
            lastLabel.trigger("click");
            lastLabel
              .addClass("instanda-selected")
              .removeClass("instanda-unselected");
          }

          $("#question483357").addClass("hidden");
          $("#question483357").attr("required", false);
        } else {
          console.log("else block");
          $("#question483357").removeClass("hidden");
          $("#question483357").attr("required", true);
        }
      }
    }
  }
  // Initial execution
  //Auto
  vehicleLogic();
  // Bind event handler, ensuring logic runs only in correct context on input
  //Auto
  $('input[name="GaragingPostcodeCm_TXT"]').on("input", function () {
    vehicleLogic();
  });

  //show or hide Medical Payments. --- need to paste
  //Auto
  function hideMedicalPayments() {
    // Only run if target page exists
    if (
      $(".page-quickquotequestions.page-number-6.package-24338").length === 0
    ) {
      return;
    }

    // Cache DOM elements and variables
    const $question = $("#question483280");
    const $medPayVal = $("#MedPayVal");
    const state = Instanda?.Variables?.PremiumState_CHOICE || "";
    const covTypeVal = $("#CovTypeValue").val() || "";

    // Error handling for missing critical elements
    if (!$question.length || !$medPayVal.length) {
      console.log("Critical elements #question483280 or #MedPayVal not found");
      return;
    }
    if (!state) {
      console.log(
        "PremiumState_CHOICE is undefined, exiting hideMedicalPayments"
      );
      return;
    }

    // Utility functions
    const showField = () => {
      $question.show();
      $medPayVal.prop("disabled", false); // Enable MedPayVal when visible
      // Default to $5,000 unless overridden by state logic
      if (
        $medPayVal.find("option").filter(function () {
          return $(this).val() === "$5,000";
        }).length > 0
      ) {
        $medPayVal.val("$5,000");
      }
    };
    const hideField = () => {
      $question.hide();
      $medPayVal.prop("disabled", true); // Disable MedPayVal when hidden
    };

    // Default: Hide field
    hideField();

    // State-specific rules
    const stateRules = {
      Connecticut: () => {
        if (covTypeVal === "Single" || covTypeVal === "Split") {
          showField();
          // Check Basic PIP value
          const basicPIPYesSelected = $(`label:has(#BasicPIP_YNPYes)`).hasClass(
            "instanda-selected"
          );
          const basicPIPNoUnselected = $(`label:has(#BasicPIP_YNPNo)`).hasClass(
            "instanda-unselected"
          );
          if (basicPIPYesSelected && basicPIPNoUnselected) {
            $medPayVal.val(""); // Set to empty string if Basic PIP is Yes
          }
        }
      },
      Kansas: () => {
        if (covTypeVal === "Split") {
          console.log("Showing field for Kansas with Split Coverage Type");
          showField();
        }
      },
      "New Hampshire": () => {
        if (covTypeVal === "Single") {
          console.log(
            "Showing field for New Hampshire with Single Coverage Type"
          );
          showField();
        }
      },
      default: () => {
        if (covTypeVal === "Single" || covTypeVal === "Split") {
          console.log(
            "Showing field for non-Kansas/New Hampshire with Single or Split Coverage Type"
          );
          showField();
        }
      },
    };

    // Apply state-specific rules
    if (stateRules[state]) {
      stateRules[state]();
    } else {
      stateRules.default();
    }
  }
  // Debounced function for event handlers
  const debouncedHideMedicalPayments = debounce(hideMedicalPayments, 100);
  // Initial call
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      hideMedicalPayments();
    }
  });
  //Auto
  // Event bindings
  $("#question482293").on("change", debouncedHideMedicalPayments);
  // Also bind to Basic PIP
  //Auto
  $("#BasicPIP_YNPYes, #BasicPIP_YNPNo").on(
    "change",
    debouncedHideMedicalPayments
  );

  //show or hide Accidental Death Benefit. -- need to paste
  //Auto
  function hideAccidentalDeath() {
    // Only run logic if in the appropriate context
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      const state = Instanda.Variables.PremiumState_CHOICE;
      const NamedNO = Instanda.Variables.NamedNonOwnPol_YN;
      const CurrentProductVersion = Instanda.Variables.RatingStructure1_TXT;
      const regularVeh = Instanda.Variables.RegularCalc_SUM;
      const ExtendNO = Instanda.Variables.AccidentalVeh_SUM;
      const inceptionDateObj = parseInstandaDate(
        Instanda.Variables.InceptionDate_DATE
      );
      const cutoff = new Date(2019, 4, 1); // May 1, 2019
      const hasValidInceptionDate = !Number.isNaN(inceptionDateObj.getTime());

      if (state === "") {
        return; // Do nothing if the state is empty
      } else if (
        state === "New Jersey" &&
        Instanda.Variables.PolicyType_CHOICE === "BASIC"
      ) {
        console.log("call1");
        $("#question483273").hide();
      } else if (state === "Kansas" && $("#CovTypeValue").val() === "Split") {
        console.log("call2");
        $("#question483273").show();
      } else if (
        state === "New York" &&
        hasValidInceptionDate &&
        inceptionDateObj >= cutoff &&
        regularVeh > 0 &&
        ExtendNO > 0
      ) {
        console.log("call3");
        $("#question483273").show();
      } else if (
        !(
          state === "Kansas" ||
          state === "New Jersey" ||
          state === "New York"
        ) &&
        NamedNO === "Yes"
      ) {
        console.log("call4");
        $("#question483273").hide();
      } else {
        // No matching condition, do nothing or add additional fallback logic if needed
        console.log("No condition met in hideAccidentalDeath");
      }
    }
  }
  // Initial run
  //Auto
  hideAccidentalDeath();

  // Bind the change event, wrapped in logic scope check
  //Auto
  $("#question482293").on("change", function () {
    console.log("input changes function called", $("#CovTypeValue").val());
    hideAccidentalDeath();
  });

  //Show or hide Core Coverage Fields.
  //Auto
  function RenderCoreFields() {
    if (isReadOnlyView()) return;
    // Only execute if on the correct page/package
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      // Set default towing value
      if ($("#TowingVal").val() === "") {
        // BH-22011 Fix to set the values only if its empty
        $("#TowingVal").val("25");
      }

      // Hide all relevant sections initially
      $("#question483556").hide();
      $("#question483556")
        .find("input, select, textarea")
        .prop("disabled", true);
      $("#question483256").hide();
      $("#question483251").hide();
      $("#question483140").hide();
      $("#question483139").hide();

      // Gather key variables
      const regularVeh = Instanda.Variables.RegularCalc_SUM;
      const ExtendNO = Instanda.Variables.AccidentalVeh_SUM;
      const state = Instanda.Variables.PremiumState_CHOICE;

      if (
        Instanda.Variables.PolicyType_CHOICE === "CORE COVERAGE" &&
        regularVeh > 0 &&
        ExtendNO === 0
      ) {
        // Show main question fields for core coverage
        console.log("if block");
        $("#question483138").show();
        $("#question483556").show(); // Towing and Labor
        $("#question483556")
          .find("input, select, textarea")
          .prop("disabled", false);
        if (state === "Michigan") {
          if ($("#TowingVal").val() === "") {
            // BH-22011 Fix to set the values only if its empty
            $("#TowingVal").val("25.0000000000");
          }
        }
        $("#question483256").show(); // Total Loss Deductible Waiver
        $("#question483251").show(); // OEM Parts Coverage
        $("#question483140").show(); // New Vehicle Replacement
        $("#question483139").show(); // Loan/Lease Coverage
        $("#question483259").show(); // Increased Limit Transportation bug fix

        if (state === "New York") {
          // In New York, fields are preset and locked
          $("#TransportExpDropdownVal")
            .val("$1,200 limit included with daily maximum of $40")
            .css({
              "pointer-events": "none",
              cursor: "not-allowed",
              "background-color": "#eee",
              color: "#888",
            });

          $("#TowingVal").val("25").css({
            "pointer-events": "none",
            cursor: "not-allowed",
            "background-color": "#eee",
            color: "#888",
          });

          $("#question483139").addClass("readonly");
          $("#question483140").addClass("readonly");
          $("#question483251").addClass("readonly");

          console.log(
            "New York state executed for Increased Limit Transportation "
          );
        } else {
          // Remove readonly states if not New York
          $("#TransportExpDropdownVal").css({
            "pointer-events": "",
            cursor: "",
            "background-color": "",
            color: "",
          });
          $("#TowingVal").css({
            "pointer-events": "",
            cursor: "",
            "background-color": "",
            color: "",
          });
          $("#question483139").removeClass("readonly");
          $("#question483140").removeClass("readonly");
          $("#question483251").removeClass("readonly");
        }
      } else {
        console.log("else block");
        // Hide all questions if logic does not apply
        $("#question483138").hide();
        $("#question483556").hide();
        $("#question483556")
          .find("input, select, textarea")
          .prop("disabled", true);
        $("#question483256").hide();
        $("#question483251").hide();
        $("#question483140").hide();
        $("#question483139").hide();
        $("#question483259").hide();

        // Remove readonly states just in case
        $("#TransportExpDropdownVal").css({
          "pointer-events": "",
          cursor: "",
          "background-color": "",
          color: "",
        });
        $("#TowingVal").css({
          "pointer-events": "",
          cursor: "",
          "background-color": "",
          color: "",
        });
        $("#question483139").removeClass("readonly");
        $("#question483140").removeClass("readonly");
        $("#question483251").removeClass("readonly");
      }
    }
    // Clear Towing Value if hidden
    if (!$("#question483556").is(":visible")) {
      $("#TowingVal").val("").trigger("change");
    }
  }

  // Run on page ready (after slight delay for async variable loading)
  //Auto
  $(document).ready(function () {
    // Check for page context before running function
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      setTimeout(RenderCoreFields, 500);
    }
  });

  //Hide or show Property Damage --- need to paste
  //Auto
  function hidePropertyDamage() {
    // Only run if target page exists
    if (
      $(".page-quickquotequestions.page-number-6.package-24338").length === 0
    ) {
      console.log("Target page not found, exiting hidePropertyDamage");
      return;
    }

    // Cache DOM elements and variables
    const $question = $("#question483135");
    const state = Instanda?.Variables?.PremiumState_CHOICE || "";
    const umTypeVal = $("#UMTypeValue").val() || "";
    const covTypeVal = $("#CovTypeValue").val() || "";

    // Error handling for missing critical elements
    if (!$question.length) {
      console.log("Critical element #question483135 not found");
      return;
    }
    if (!state) {
      console.log(
        "PremiumState_CHOICE is undefined, exiting hidePropertyDamage"
      );
      return;
    }

    // Utility function
    const showField = () => {
      $question.show();
      $question.find("input, select, textarea").prop("disabled", false);
    };

    const hideField = () => {
      $question.hide();
      $question.find("input, select, textarea").prop("disabled", true);
    };

    // Default: Hide field
    hideField();

    // State-specific rules
    const stateRules = {
      "South Carolina": () => {
        if (umTypeVal === "Split") {
          console.log("Showing field for South Carolina with Split UM Type");
          showField();
        }
      },
      "District Of Columbia": () => {
        if (umTypeVal === "Split") {
          console.log(
            "Showing field for District Of Columbia with Split UM Type"
          );
          showField();
        }
      },
      "West Virginia": () => {
        if (umTypeVal === "Split") {
          console.log("Showing field for West Virginia with Split UM Type");
          showField();
        }
      },
      Washington: () => {
        if (covTypeVal === "Split") {
          console.log("Showing field for Washington with Split Coverage Type");
          showField();
        }
      },
    };

    // Apply state-specific rules
    if (stateRules[state]) {
      stateRules[state]();
    }
  }

  // Debounced function for event handlers
  const debouncedHidePropertyDamage = debounce(hidePropertyDamage, 100);

  // Initial call
  //Auto
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    hidePropertyDamage();
  }
  // Event bindings
  //Auto
  $("#question483032, #question482293").on(
    "change",
    debouncedHidePropertyDamage
  );

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////Adding new code //coverages

  //Hide TORT for PA state
  //Auto
  function hideTortPA() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;

      if (state === "") {
        console.log("PremiumState_CHOICE is empty, aborting hideTortPA.");
        return; // Do nothing if the state is empty
      }

      if (state === "Pennsylvania") {
        if ($("#CovTypeValue").val() === "Physical Damage Only") {
          $("#question482455").hide();
          $("#Tort_CHOICE").attr("required", false);
          // Remove red asterisk if it exists
          $("#question482455 label .required-asterisk").remove();
        } else {
          // Ensure no duplicate asterisks before adding
          $("#question482455 label .required-asterisk").remove();
          // Add red asterisk to the label of the parent question
          $("#question482455 label").each(function () {
            if ($(this).find(".required-asterisk").length === 0) {
              $(this).append(
                '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
              );
            }
          });
          $("#question482455").show();
          $("#Tort_CHOICE").attr("required", true);
        }
      } else {
        // Optional: you may want to hide the Tort field if not PA
        $("#question482455").hide();
        $("#Tort_CHOICE").attr("required", false);
        $("#question482455 label .required-asterisk").remove();
      }
    }
  }
  //Auto
  hideTortPA();
  //Auto
  $("#question482293").on("change", function () {
    console.log("input changes function called", $("#CovTypeValue").val());
    hideTortPA();
  });

  //Additional PIP, Wage Loss/Month
  //Additional PIP, Other Expenses/Day
  //Additional PIP, Death Benefit
  //Auto
  function addPipCombLimDependentFields() {
    if (isReadOnlyView()) return;
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var apipcombinedval = $("#APIPCombinedVal").val();

      if (state === "") {
        console.log("State is empty; aborting PIP logic.");
        return; // Do nothing if the state is empty
      }

      if (state === "New York") {
        console.log("Processing New York-specific PIP logic.");

        if (apipcombinedval !== "None") {
          // Show and set required on all relevant NY PIP fields
          $("#question483890").show().attr("required", true); // Wage Loss/Month
          $("#question483899").show().attr("required", true); // Other Expenses/Day
          $("#question483902").show(); // Death Benefit

          // Set default values for Wage Loss/Month based on Combined Limit
          var wageLossField = $("#AddPIPWageLossMonthNY_CHOICE");
          if (apipcombinedval === "$25,000") {
            wageLossField.val("$500");
          } else if (apipcombinedval === "$50,000") {
            wageLossField.val("$1,000");
          } else if (apipcombinedval === "$100,000") {
            wageLossField.val("$2,000");
          }
          console.log("Show PIP-related questions for New York.");
        } else {
          // Hide and unset required for these fields if "None"
          $("#question483890").hide().attr("required", false);
          $("#question483899").hide().attr("required", false);
          $("#question483902").hide();
          console.log(
            "Hide PIP-related questions for New York (Combined Limit is None)."
          );
        }
      } else {
        // Hide and unset required on all relevant NY PIP fields if NOT New York
        $("#question483890").hide().attr("required", false);
        $("#question483899").hide().attr("required", false);
        $("#question483902").hide();
        console.log("Not New York; Hide all NY-specific PIP questions.");
      }
    }
  }
  //Auto
  addPipCombLimDependentFields();
  //Auto
  $("#question483888").on("change", function () {
    console.log("input changes function called", $("#question483888").val());
    addPipCombLimDependentFields();
  });

  //show qualified health coverage field 14
  //Auto
  function showQualifiedHealthCov() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var piplim = $("#PIPLim_CHOICE").val();
      var $qualHealthCover = $("#question482491");
      var $qualHealthInput = $("#QualHealthCover_CHOICE");
      var $cslLimit = $("#CSLLimit");

      if (piplim === "") {
        console.log("PIP Limit is empty; aborting function.");
        return; // Do nothing if PIP Limit is empty
      }

      if (piplim === "$250,000") {
        $qualHealthCover.show();
        $qualHealthInput.attr("required", true);

        // Only set CSLLimit if it's empty, "Please select", or invalid
        var currCSL = $cslLimit.val();
        if (
          !currCSL ||
          currCSL === "Please select" ||
          !$cslLimit.find("option[value='" + currCSL + "']").length
        ) {
          if (state && state.trim() === "Michigan") {
            setCSLLimitValue("$510,000");
          } else {
            setCSLLimitValue("$300,000");
          }
        }

        console.log(
          "Showing Qualified Health Coverage question and setting CSLLimit."
        );
      } else {
        $qualHealthCover.hide();
        $qualHealthInput.attr("required", false);

        // Optionally reset CSLLimit value if needed
        // Uncomment the next line if you want to clear on hide:
        // setCSLLimitValue("");
        console.log("Hiding Qualified Health Coverage question.");
      }
    }
  }

  // Auto
  $(document).ready(function () {
    // Only proceed if on the correct page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      showQualifiedHealthCov();

      // Bind change event to #question482489
      // (If PIPLim_CHOICE or other related element changes, ensure this selector covers it)
      $("#question482489, #PIPLim_CHOICE").on("change", function () {
        console.log("input changes function called", $("#CovTypeValue").val());
        showQualifiedHealthCov();
      });
    }
  });

  //Basic PIP, Combined Limit and Basic PIP, Death Benefit default values,
  //Auto
  function commonFLNYFields() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var policyType = Instanda.Variables.PolicyType_CHOICE;

      if (state === "") {
        console.log("State is empty; aborting function.");
        return; // Do nothing if the state is empty
      }

      if (state === "New York") {
        // Basic PIP, Death Benefit NY-$2000
        $("#question482517 input").val(2000);

        // Basic PIP, Combined Limit NY - $50,000
        $("#BasicPIPCLNYFL_NUM").val("50000");

        // Hide Florida-specific fields as a safeguard
        $("#question483886").hide();
        $("#question483887").hide();
      } else if (state === "Florida") {
        console.log("Default Florida");

        const excludeWorkLoss = $("#ExcludeWorkLossFL_CHOICE").val();
        const pipded = $("#PIPDeductVal_TXT").val();

        // Basic PIP, Death Benefit FL-$5000
        $("#question482517 input").val(5000);

        // Basic PIP, Combined Limit FL-$10,000
        $("#BasicPIPCLNYFL_NUM").val("10000");

        // Extended PIP, Medical Expense 100% , Work Loss 0%
        // Show if NO 'PIP deductible' OR 'Exclude Work Loss' = 'Named Insured Only'
        if (excludeWorkLoss === "Named Insured Only" || pipded === "") {
          $("#question483886").show();
        } else {
          $("#question483886").hide();
        }

        // Extended PIP, Medical Expense 100% , Work Loss 80%
        // Show if NO 'PIP deductible' OR 'Exclude Work Loss' NOT 'Named Insured Only'
        if (excludeWorkLoss !== "Named Insured Only" || pipded === "") {
          $("#question483887").show();
        } else {
          $("#question483887").hide();
        }
      } else {
        // Hide state-specific UI if not NY or FL
        $("#question482517 input").val("");
        $("#BasicPIPCLNYFL_NUM").val("");
        $("#question483886").hide();
        $("#question483887").hide();
      }
    }
  }
  //Auto
  $(document).ready(function () {
    // Only proceed if on the correct page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      // Initial run
      commonFLNYFields();

      // Change handlers only set up on correct page
      $("#PIPDeductVal_TXT").on("change", function () {
        console.log(
          "input changes function called",
          $("#PIPDeductVal_TXT").val()
        );
        commonFLNYFields();
      });

      $("#ExcludeWorkLossFL_CHOICE").on("change", function () {
        console.log(
          "input changes function called",
          $("#ExcludeWorkLossFL_CHOICE").val()
        );
        commonFLNYFields();
      });
    }
  });



  // Combined function to determine the default UM Type and check if it is mandatory
  //Auto

  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    function getUMTypeAndMandatoryStatus() {
      if (isReadOnlyView()) return;
      // Define the states and their applicable UM types
      const stateUMTypes = {
        "New Jersey": ["Split"],
        Connecticut: ["CSLBI"],
        Illinois: ["CSL"],
        Indiana: ["CSL", "CSLBI"],
        Missouri: ["CSL"],
        "South Carolina": ["CSL", "Split"],
        "District Of Columbia": ["CSL", "Split"],
        "North Dakota": ["CSLBI"],
        Oregon: ["CSLBI"],
        Maryland: ["CSL"], // Specific condition for MD
        Virginia: ["CSL"],
        Minnesota: ["CSLBI"],
        "West Virginia": ["Split"],
        Kansas: ["Split"], // Specific condition for KS
        Maine: ["CSLBI"],
        "New Hampshire": ["CSL"], // Specific condition for NH
        "Rhode Island": ["CSLBI"],
        "South Dakota": ["CSLBI"],
        Vermont: ["CSLBI"],
        Wisconsin: ["CSLBI"],
        "North Carolina": ["Split"], // Specific condition for NC
        Pennsylvania: ["Split", "Single"], // Specific condition for PA
        Texas: ["CSL"], // Specific condition for TX
      };
      var state = Instanda.Variables.PremiumState_CHOICE;
      var namedNonOwnerPolicy = Instanda.Variables.NamedNonOwnPol_YN;
      var coverageType = $("#CovTypeValue").val();
      var bodilyInjury = $("#BodilyInjValueOtStates").val();
      const applicableUMTypes = stateUMTypes[state];

      // Determine the default UM Type based on the given conditions
      if (
        !["CSL", "Split", "CSL BI", "Single"].includes($("#UMTypeValue").val())
      ) {
        $("#UMTypeValue").val("");
      }

      if (
        state === "North Carolina" &&
        namedNonOwnerPolicy === "No" &&
        coverageType === "Split" &&
        bodilyInjury === "$250,000/$500,000"
      ) {
        $("#UMTypeValue").val("Split"); // Specific condition for NC
      } else if (coverageType === "Single") {
        console.log("Single...");
        if (state === "New Hampshire") {
          if (!$('#UMTypeValue').val()) {
            $('#UMTypeValue').val('CSL')
          }

          $("#question483958").show(); //Render CSL if 'UM Type' (PAF0245) = 'CSL'
          $("#question483958").attr("required", true); // Specific condition for NH
        } else if (state === "Pennsylvania") {
          $("#UMTypeValue").val("Single"); // Specific condition for PA and TX
        } else if (
          applicableUMTypes &&
          applicableUMTypes.includes("CSL") &&
          applicableUMTypes.includes("CSLBI")
        ) {
          if (!$('#UMTypeValue').val()) {
            $('#UMTypeValue').val('CSL')
          }
          $("#question483958").show(); //Render CSL if 'UM Type' (PAF0245) = 'CSL'
          $("#question483958").attr("required", true);
        } else if (applicableUMTypes && applicableUMTypes.includes("CSL")) {
          if (!$('#UMTypeValue').val()) {
            $('#UMTypeValue').val('CSL')
          }
          $("#question483958").show(); //Render CSL if 'UM Type' (PAF0245) = 'CSL'
          $("#question483958").attr("required", true);
        } else if (applicableUMTypes && applicableUMTypes.includes("CSLBI")) {
          $("#UMTypeValue").val("CSL BI");
          //show CSL BI
          $("#question483056").show();
          $("#UMCSLBILimitVal").prop("required", true);
        }
      } else if (coverageType === "Split") {
        if (state === "Kansas") {
          $("#UMTypeValue").val("Split"); // Specific condition for KS
        } else if (applicableUMTypes && applicableUMTypes.includes("Split")) {
          $("#UMTypeValue").val("Split");
        }
      }

      // Check if UM Type is mandatory based on State and Named Non-Owner Policy
      if (state === "Maryland") {
        $("#UMTypeValue").attr("required", true);
        $("#question483032 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
        // add mandatory n asterisk for UM TYpe
      } else if (state === "North Carolina" && namedNonOwnerPolicy === "No") {
        $("#UMTypeValue").attr("required", true);
        $("#question483032 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
      } else {
        $("#UMTypeValue").attr("required", false);
        $("#question483032 label .required-asterisk").remove();
      }
      //maybe need a last else

      // $('#UMTypeValue').val("");  //replace question id
    }
    getUMTypeAndMandatoryStatus();

    $("#question483594").on("change", function () {
      getUMTypeAndMandatoryStatus();
    });
    $("#question482293").on("change", function () {
      getUMTypeAndMandatoryStatus();
    });
  }
  // UM Type common Function
  //Auto
  function umTypeDependent() {
    var state = Instanda.Variables.PremiumState_CHOICE;
    const umTypeVal = $("#UMTypeValue").val();
    if (umTypeVal === "") {
      //if UM Type is empty
      //hide Converted Coverage
      $("#question483122").hide();
      $("#question483122").attr("required", false);

      //hide reduced UM
      $("#question483124").hide();
      $("#question483124").attr("required", false);

      //hide UMPD rejected
      $("#question483125").hide();

      // Enhanced Underinsured Motorist Coverage
      $("#question483127").hide();
      $("#question483127").attr("required", false);

      //hide CSL
      $("#question483958").hide();
      $("#question483958").attr("required", false);

      //hide BI Deductible
      $("#question483103").hide();

      //hide CSL BI
      $("#question483056").hide();
      $("#UMCSLBILimitVal").prop("required", false);
    } else {
      // if it has any value irrespective of what the value is
      if (state === "Connecticut") {
        //show Converted Coverage
        $("#question483122").show();
        $("#question483122").attr("required", true);
      }
      if (state === "Georgia" || state === "Virginia") {
        //show reduced UM
        $("#question483124").show();
        $("#question483124").attr("required", true);
      }
      if (state === "California") {
        //show UMPD rejected
        $("#question483125").show();
      }
    }
    if (
      state === "Maryland" &&
      (umTypeVal === "Split" || umTypeVal === "CSL")
    ) {
      //show Enhanced Underinsured Motorist Coverage

      $("#question483127").show();
      $("#question483127").attr("required", true);
    } else {
      $("#question483127").hide();
      $("#question483127").attr("required", false);
    }

    if ((state === "Pennsylvania" && umTypeVal === "Single") ||
      (state !== "Pennsylvania" && umTypeVal === "CSL BI")) {
      //show CSL BI
      $("#question483056").show();
      $("#UMCSLBILimitVal").prop("required", true);
    } else {
      //hide CSL BI
      $("#question483056").hide();
      $("#UMCSLBILimitVal").prop("required", false);
    }
    if (umTypeVal === "CSL") {
      //show CSL
      $("#question483958").show();
      $("#question483958").attr("required", true);
    } else {
      //hide CSL
      $("#question483958").hide();
      $("#question483958").attr("required", false);
    }

    if (umTypeVal === "Split" && state === "Georgia") {
      //show BI Deductible

      $("#question483103").show();
    } else {
      //hide BI Deductible

      $("#question483103").hide();
    }
  }
  //Auto
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    $(document).ready(function () {
      umTypeDependent();
      $("#question483032").on("change", function () {
        umTypeDependent();
      });
      $("#question482293").on("change", function () {
        umTypeDependent();
      });
    });
  }

  // common function towing and labor
  //Auto
  function towingAndLabor() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var validStates = [
        "Alabama",
        "Arkansas",
        "Arizona",
        "California",
        "Colorado",
        "Connecticut",
        "District Of Columbia",
        "Florida",
        "Georgia",
        "Iowa",
        "Idaho",
        "Illinois",
        "Indiana",
        "Kentucky",
        "Louisiana",
        "Maryland",
        "Michigan",
        "Minnesota",
        "Missouri",
        "Montana",
        "New Hampshire",
        "New Jersey",
        "Nevada",
        "Ohio",
        "Oklahoma",
        "Oregon",
        "Pennsylvania",
        "Rhode Island",
        "South Carolina",
        "Tennessee",
        "Texas",
        "Utah",
        "Washington",
        "Wisconsin",
        "Wyoming",
      ];

      var currentState = Instanda.Variables.PremiumState_CHOICE;
      var isValidState = validStates.includes(currentState);
      var towingVal = $("#TowingVal").val();

      console.log(
        "Is valid towing state?",
        isValidState,
        "Towing Value:",
        towingVal
      );

      if (isValidState && Number(towingVal) === 100) {
        // Show the relevant UI elements and set default values
        $("#question483262").show();
        $("#question483263").show();

        $("#question483262 input").val("100Miles");
        $("#question483263 input").val("100Miles");

        console.log(
          "Showing towing and labor fields, setting default to 100Miles."
        );
      } else {
        // Hide the elements if not the valid state or towing value
        $("#question483262").hide();
        $("#question483263").hide();

        // Optionally reset values if you want to clear them when hidden
        // $('#question483262 input').val('');
        // $('#question483263 input').val('');

        console.log("Hiding towing and labor fields.");
      }
    }
  }

  $(document).ready(function () {
    // Only proceed if on the correct page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      towingAndLabor();
      //Auto
      $("#question483556").on("change", function () {
        console.log("Towing value changed to:", $("#TowingVal").val());
        towingAndLabor();
      });
    }
  });

  // show PD Deductible with event listener
  //Auto
  function showPDDeductible() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var pdValue = $("#PropertyDamageVal").val();

      // Always hide by default, then show if needed
      $("#question483137").hide();

      if (pdValue === "") {
        console.log("Property Damage value is empty; hiding deductible field.");
        return;
      }

      if (state === "South Carolina") {
        $("#question483137").show();
        console.log("Showing PD Deductible for South Carolina.");
      } else {
        console.log("Not South Carolina; keeping PD Deductible hidden.");
      }
    }
  }
  //Auto
  showPDDeductible();
  //Auto
  $("#PropertyDamageVal").on("change", function () {
    console.log("input changes function called", $("#PropertyDamageVal").val());
    showPDDeductible();
  });

  //medical expenses cov screen
  //Auto
  function MedicalExpenses() {
    var state = Instanda.Variables.PremiumState_CHOICE;
    var policyType = Instanda.Variables.PolicyType_CHOICE;
    var basicPip = $("#question482487 .instanda-selected input").val();
    var basicFirstPartyBen = $(
      "#question482536 .instanda-selected input"
    ).val();

    const includedStates = [
      "District Of Columbia",
      "Pennsylvania",
      "Oregon",
      "Minnesota",
      "Kansas",
      "Utah",
    ];

    function isInputEmpty(elem) {
      const val = elem.val();
      return val === null || val === undefined || val === "";
    }

    if (state === "") {
      return; // Do nothing if the state is empty
    }

    if (state === "New Jersey") {
      var $medExpValNJ = $("#MedExpValNJ");

      // Only set default if the input is empty
      if (isInputEmpty($medExpValNJ)) {
        $medExpValNJ.val("$250,000");
        console.log("Defaulted MedExpValNJ to $250,000");
      } else {
        console.log("MedExpValNJ value retained as:", $medExpValNJ.val());
      }

      // If 'Policy Type' (PAF0003) = 'Basic' then default 'Medical Expense' (PAF0325) to '$15,000'
      if (policyType === "BASIC") {
        $medExpValNJ.val("$15,000");
        $medExpValNJ.attr("required", true);
        console.log("Policy Type is BASIC: Defaulting MedExpValNJ to $15,000");
      }
    } else if (
      (basicPip === "Yes" || basicFirstPartyBen === "Yes") &&
      includedStates.includes(state)
    ) {
      $("#question483614")
        .show()
        .attr("required", true)
        .removeClass("readonly");

      switch (state) {
        case "Oregon":
          document.getElementById("MedExpensesOtherStateVal").value = "$15,000";
          $("#question483614").addClass("readonly");
          console.log("Oregon medical expenses set to $15,000");
          break;
        case "Minnesota":
          document.getElementById("MedExpensesOtherStateVal").value = "$20,000";
          $("#question483614").addClass("readonly");
          console.log("Minnesota medical expenses set to $20,000");
          break;
        case "Kansas":
          document.getElementById("MedExpensesOtherStateVal").value = "$4,500";
          $("#question483614").addClass("readonly");
          console.log("Kansas medical expenses set to $4,500");
          break;
        case "Utah":
          document.getElementById("MedExpensesOtherStateVal").value = "$3,000";
          console.log("Utah medical expenses set to $3,000");
          break;
      }
    } else {
      $("#question483614")
        .hide()
        .attr("required", false)
        .removeClass("readonly");
      console.log("Medical expenses hidden");
      $("#MedExpValNJ").attr("required", false);
      // document.getElementById('MedExpensesOtherStateVal').value = "";
    }
  }
  //Auto

  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      setTimeout(MedicalExpenses, 500);

      // MedicalExpenses();
      $("#question482536").on("change", function () {
        MedicalExpenses();
      });
      $("#question482487").on("change", function () {
        MedicalExpenses();
      });
    }
  });

  //Auto
  function ExtMedicalExpensesDefVal() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var policyType = Instanda.Variables.PolicyType_CHOICE;

      // Exit early if state is blank
      if (state === "") {
        console.log(
          "State selection empty; not setting Extended Medical Expenses."
        );
        return;
      }

      // New Jersey + BASIC logic
      if (state === "New Jersey" && policyType === "BASIC") {
        // Set default value and make field required
        $("#ExtMedExp_CHOICEP").val("$10,000");
        $("#question493360").attr("required", true);

        // Only append the asterisk if not present
        $("#question493360 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });

        console.log(
          "Set Extended Medical Expenses to $10,000 and marked as mandatory for NJ Basic."
        );
      } else {
        // Remove requirement, asterisk, and clear value otherwise
        $("#question493360").attr("required", false);
        $("#question493360 label .required-asterisk").remove();
        if (!$("#ExtMedExp_CHOICEP").val()) $("#ExtMedExp_CHOICEP").val(null);

        console.log("Cleared Extended Medical Expenses and requirement.");
      }
    }
  }
  //Auto
  ExtMedicalExpensesDefVal();

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //Coverages screen phase 2

  //////////////////////////////////Default values and Display Conditions Covg Screen Auto Start //////////////////////////////////
  //Auto
  function KTBasicPipIsBasic() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var pipType = $("#BasicPIPKY_CHOICEP").val();

      var $allQuestions = $(
        "#question483906, #question483912, #question483921, #question483927, #question482570"
      );
      var $allInputs = $(
        "#BasicPIPReplServiWeekCTKY_NUM, #BasicPIPFuneralExpCTKYND_NUM, #BasicPIPWorkLossCTKY_NUM, #BasicPIPWorkLossWeekCTKY_NUM, #BasicPIPAggLim"
      );

      if (state === "Kentucky" && pipType === "Basic") {
        $allQuestions.show();
        $allInputs.prop("required", true).prop("disabled", false);

        $("#BasicPIPReplServiWeekCTKY_NUM").val(200);
        $("#BasicPIPFuneralExpCTKYND_NUM").val(1000);
        $("#BasicPIPWorkLossCTKY_NUM").val(85);
        $("#BasicPIPWorkLossWeekCTKY_NUM").val(200);

        console.log("KY Basic PIP active: fields shown and required.");
      } else {
        $allQuestions.hide();
        $allInputs.prop("required", false).prop("disabled", true);

        console.log("KY Basic PIP inactive: fields hidden and disabled.");
      }
    }
  }

  // Initial trigger on load
  $(document).ready(function () {
    if (Instanda.Variables.PremiumState_CHOICE === "Kentucky")
      setTimeout(KTBasicPipIsBasic, 200);

    // Trigger on change
    $("#BasicPIPKY_CHOICEP").on("change", function () {
      KTBasicPipIsBasic();
    });
  });


  // BH-28287 Show or hide UMPD warning for IL and other states
  function showHideUMPDWarning() {
    const propertyDamage = document.querySelector("#question483960");
    const header = document.querySelector("#question488722");
    const umType = document.querySelector("#UMTypeValue");
    const section = header.parentElement
    if (!(propertyDamage && header)) return;
    if (propertyDamage.style.display == "none") section.style.display = "none"
    else section.style.display = "block"
  }

  // BH-28308 Make Deletion of Benefit required or optional
  function makeDelOfBenefitRequired() {
    const quesId = document.querySelector("#question482495 input");
    const covType = document.querySelector("#CovTypeValue");
    if (!(quesId && covType)) return;
    if (covType.value !== "Physical Damage Only") quesId.required = true;
    else quesId.required = false;
  }

  $(document).ready(() => {
    if (document.querySelector(".page-quickquotequestions.page-number-6.package-24338")) {
      makeDelOfBenefitRequired();
      setTimeout(showHideUMPDWarning, 500);
      document.querySelector("#CovTypeValue").addEventListener("change", makeDelOfBenefitRequired);
      document.querySelector("#UMTypeValue").addEventListener("change", () => setTimeout(showHideUMPDWarning, 500));
    }

  })

  function CTDEBasicPipIsYes() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var basicPIPValue =
      $("#question482487 .instanda-selected input").val() || "Yes";

    // 1. SELECT ALL RELEVANT CONTAINERS AND INPUTS
    var $ctFields = $(
      "#question483906, #question483912, #question483921, #question483927, #question482570"
    );
    var $ctInputs = $(
      "#BasicPIPReplServiWeekCTKY_NUM, #BasicPIPFuneralExpCTKYND_NUM, #BasicPIPWorkLossCTKY_NUM, #BasicPIPWorkLossWeekCTKY_NUM, #BasicPIPAggLim"
    );

    var $ndFields = $("#question483912, #question482570");
    var $ndInputs = $("#BasicPIPFuneralExpCTKYND_NUM, #BasicPIPAggLim");

    // 2. GLOBAL RESET: Hide and disable everything first
    $ctFields.hide();
    $ctInputs.prop("required", false).prop("disabled", true);

    // 3. STATE LOGIC
    if (state === "Connecticut") {
      if (basicPIPValue === "Yes") {
        $ctFields.show();
        $ctInputs.prop("required", true).prop("disabled", false);

        // Set CT Defaults
        $("#BasicPIPReplServiWeekCTKY_NUM").val(200);
        $("#BasicPIPFuneralExpCTKYND_NUM").val(2000);
        $("#BasicPIPWorkLossCTKY_NUM").val(85);
        $("#BasicPIPWorkLossWeekCTKY_NUM").val(200);
        $("#BasicPIPAggLim").val(5000);
        console.log("CT Basic PIP: Enabled");
      } else {
        // Trigger additional Instanda logic if Basic PIP is 'No'
        setTimeout(() => {
          $("#AddedPIPOTStates_YNPNo").trigger("click");
          $("#question482631").trigger("change");
        }, 10);
      }
    } else if (state === "North Dakota") {
      if (basicPIPValue === "Yes") {
        $ndFields.show();
        $ndInputs.prop("required", true).prop("disabled", false);

        // Set ND Defaults
        $("#BasicPIPFuneralExpCTKYND_NUM").val(3500);
        $("#BasicPIPAggLim").val(30000);
        console.log("ND Basic PIP: Enabled");
      }
    }
  }

  // Initial trigger and event binding
  $(document).ready(function () {
    CTDEBasicPipIsYes();

    $("#question482487").on("change", function () {
      CTDEBasicPipIsYes();
    });
  });

  //Auto
  function DECovTypeSplitOrSingle() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var covType = $("#CovTypeValue").val();

    // Defensive: always reset field to hidden and not required

    $("#question483904").hide().attr("required", false); // Basic PIP Limits DE/HI

    if (state === "Delaware" && (covType === "Single" || covType === "Split")) {
      $("#question483904").show().attr("required", true);

      if (covType === "Single") {
        $("#BasicPIPLimitsDEHI_TXT").val(30000);
      } else if (covType === "Split") {
        $("#BasicPIPLimitsDEHI_TXT").val("$15000/$30000");
      }

      console.log(
        "Delaware state visibility for CovType executed (" + covType + ")"
      );
    } else {
      // Already hidden/reset above
      console.log(
        "CovType not Split/Single or not Delaware; hiding Basic PIP Limits."
      );
    }
  }

  // Initial load setup
  //Auto
  DECovTypeSplitOrSingle();

  // Re-check logic on CovTypeValue change
  //Auto
  $("#CovTypeValue").on("change", function () {
    console.log(
      "change event triggered, DECovTypeSplitOrSingle function called"
    );
    DECovTypeSplitOrSingle();
  });

  //Auto
  function HICovTypeSplitOrSingle() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;

    if (state === "Hawaii") {
      $("#BasicPIPLimitsDEHI_TXT").val("$10000");
    }
  }

  //Auto
  function HideAddedPIPCTND() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;
    var basicPIP = $("#question482487 .instanda-selected input").val();
    if (state === "Connecticut" || state === "North Dakota") {
      console.log("state is Connecticut or North Dakota for hiding added PIP");
      if (basicPIP === "Yes") {
        $("#question482631").show();
        console.log("Added PIP is shown is shown for", state);
      } else {
        $("#question482631").hide();
        console.log("Added PIP is hidden for", state);
        $('#question482631 .instanda-unselected input[value="No"]').prop(
          "checked",
          true
        );
      }
    }
  }
  //Auto
  $("#question482487").on("change", function () {
    console.log("change event triggered for hiding added pip for CT and ND");
    HideAddedPIPCTND();
  });
  //setting default values for Kansas,Minnesota,Utah,Oregon
  //Auto
  function DFValBasicPipIsYes() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var isBasicPIPYes =
      $("#question482487 .instanda-selected input").val() === "Yes";

    if (isBasicPIPYes) {
      switch (state) {
        case "Kansas":
          $("#WorkLossBasicPIP_NUM").val(900);
          $("#EssentialServBasicPIP_NUM").val(25);
          $("#SurvLossBasicPIP_NUM").val(900);
          console.log("Kansas default values executed");
          break;
        case "Minnesota":
          $("#WorkLossBasicPIP_NUM").val(250);
          $("#EssentialServBasicPIP_NUM").val(200);
          console.log("Minnesota default values executed");
          break;
        case "Utah":
          $("#WorkLossBasicPIP_NUM").val(250);
          $("#EssentialServBasicPIP_NUM").val(20);
          $("#SurvLossBasicPIP_NUM").val(3000);
          console.log("Utah default values executed");
          break;
        case "Oregon":
          $("#EssentialServBasicPIP_NUM").val(30);
          console.log("Oregon default values executed");
          break;
        default:
          console.log("No default values for selected state.");
      }
    }
  }
  // Ensure values are set after page is ready
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    // Initial call (after a brief delay for variable/UI population)
    setTimeout(DFValBasicPipIsYes, 1000);

    $("#question482487").on("change", function () {
      DFValBasicPipIsYes();
    });
  });

  //Auto
  function NJPolicyTypeIsBasic() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;
    if (state === "New Jersey") {
      if (Instanda.Variables.PolicyType_CHOICE === "BASIC") {
        $("#BasicPIPNJ_CHOICEP").val("Primary");
        $("#question482572").addClass("readonly");
      } else {
        $("#question482572").removeClass("readonly");
      }
    }
  }
  //Auto
  function NDCTAddedPipIsYes() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;
    if (state === "North Dakota") {
      if ($("#question482631 .instanda-selected input").val() === "Yes") {
        $("#question482692").show().attr("required", true); //Added PIP, Funeral Expenses
        console.log("North Dakota added fields default values are executed");
        if ($("#AddedPIPAggLim_CHOICE").val() === "40000") {
          $("#AddedPIPFunExpCTNDKY_NUM").val(3500);
        } else if ($("#AddedPIPAggLim_CHOICE").val() > "40000") {
          $("#AddedPIPFunExpCTNDKY_NUM").val(4500);
        }
      } else if ($("#question482631 .instanda-selected input").val() === "No") {
        $("#question482692").hide().attr("required", false); //Added PIP, Funeral Expenses
      }
    } else if (state === "Connecticut") {
      if ($("#question482631 .instanda-selected input").val() === "Yes") {
        $("#question482692").show().attr("required", true); //Added PIP, Funeral Expenses
        $("#question482698").show().attr("required", true); //Added PIP, Work Loss%
        $("#question482716").show().attr("required", true); //Added PIP, Work Loss/Week

        $("#AddedPIPFunExpCTNDKY_NUM").val(2000);
        console.log("Connecticut Added PIP fields are executed");
      } else {
        $("#question482692").hide().attr("required", false); //Added PIP, Funeral Expenses
        $("#question482698").hide().attr("required", false); //Added PIP, Work Loss%
        $("#question482716").hide().attr("required", false); //Added PIP, Work Loss/Week
      }
    }
  }
  //Auto
  $("#question482631").on("change", function () {
    console.log(
      "Change event triggered, NDCTAddedPipIsYes function called",
      $("#question482631 .radio-inline input").val()
    );
    NDCTAddedPipIsYes();
  });
  //Auto
  function KYAddedPipIsBasic() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;
    if (state === "Kentucky") {
      if (
        $("#AddPIPKY_NUM").val() !== "None" &&
        $("#BasicPIPKY_CHOICEP").val() !== "Guest"
      ) {
        $("#question482692").show().attr("required", true); //Added PIP, Funeral Expenses
        $("#AddedPIPFunExpCTNDKY_NUM").val(1000);
        console.log("Kentuncy Added PIP, Funeral Expenses is executed");
      } else {
        $("#question482692").hide().attr("required", false); //Added PIP, Funeral Expenses
      }
    }
    if (
      $("#AddPIPKY_NUM").val() === "" ||
      $("#BasicPIPKY_CHOICEP").val() === ""
    ) {
      $("#question482692").hide().attr("required", false); //Added PIP, Funeral Expenses
    }
  }
  //Auto
  $("#AddPIPKY_NUM").on("change", function () {
    console.log("change event is triggered, KYAddedPipIsBasic function called");
    KYAddedPipIsBasic();
  });
  //Auto
  $("#BasicPIPKY_CHOICEP").on("change", function () {
    console.log("change event is triggered, KYAddedPipIsBasic function called");
    KYAddedPipIsBasic();
  });

  //Auto
  function UnInsMotLimitLabelMulStates() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    const statesListUnInsMotLimit = [
      "California",
      "Idaho",
      "Illinois",
      "South Carolina",
      "Missouri",
      "Montana",
      "Indiana",
      "Pennsylvania",
      "District Of Columbia",
      "Wisconsin",
      "North Dakota",
      "Hawaii",
      "Arizona",
      "New Hampshire",
      "Maryland",
      "Ohio",
      "Arkansas",
      "Oregon",
      "Virginia",
      "South Dakota",
      "Iowa",
      "Utah",
      "Kansas",
      "Minnesota",
      "Michigan",
      "West Virginia",
    ];
    var state = Instanda.Variables.PremiumState_CHOICE;

    if (
      statesListUnInsMotLimit.includes(state) &&
      ($("#CovTypeValue").val() === "Single" ||
        $("#CovTypeValue").val() === "Split")
    ) {
      console.log(
        "Uninsured Motorists Limits label is executed for all included states"
      );
      $("#question498764").show(); //Uninsured Motorists Limits label
    } else if (state === "Kentucky" && $("#CovTypeValue").val() === "Split") {
      console.log("Uninsured Motorists Limits label is executed Kentuncy");
      $("#question498764").show(); //Uninsured Motorists Limits label
    } else {
      $("#question498764").hide(); //Uninsured Motorists Limits label
    }
  }
  //Auto
  $("#CovTypeValue").on("change", function () {
    console.log(
      "change event is triggered, UnInsMotLimitLabelMulStates function called"
    );
    UnInsMotLimitLabelMulStates();
  });

  //Auto
  function UnUdMorLimitLabelMulStates() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    const statesExlListUnUdMorLimit = [
      "California",
      "Idaho",
      "Illinois",
      "South Carolina",
      "Missouri",
      "Montana",
      "Indiana",
      "Pennsylvania",
      "Kentucky",
      "District Of Columbia",
      "Wisconsin",
      "North Dakota",
      "Hawaii",
      "Arizona",
      "New Hampshire",
      "Maryland",
      "Ohio",
      "Arkansas",
      "Oregon",
      "Virginia",
      "South Dakota",
      "Iowa",
      "Utah",
      "Washington",
      "Kansas",
      "Minnesota",
      "Michigan",
      "West Virginia",
    ];
    var state = Instanda.Variables.PremiumState_CHOICE;

    if (
      !statesExlListUnUdMorLimit.includes(state) &&
      ($("#CovTypeValue").val() === "Single" ||
        $("#CovTypeValue").val() === "Split")
    ) {
      console.log(
        "Uninsured / Underinsured Motorists Limits label is executed"
      );
      $("#question483031").show(); //Uninsured / Underinsured Motorists Limits label
      if (
        state === "New Jersey" &&
        Instanda.Variables.PolicyType_CHOICE === "BASIC"
      ) {
        $("#question483031").hide();
      }
    } else {
      $("#question483031").hide(); //Uninsured / Underinsured Motorists Limits label
    }
  }
  //Auto
  $("#CovTypeValue").on("change", function () {
    console.log(
      "change event triggered, UnUdMorLimitLabelMulStates function called"
    );
    UnUdMorLimitLabelMulStates();
  });

  //Auto
  function NYStatSuppCovType() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var state = Instanda.Variables.PremiumState_CHOICE;
    if (state === "New York") {
      if ($("#CovTypeValue").val() === "Single") {
        $("#question483126").show().attr("required", true); //Statutory UM - CSL BI
        $("#question483962").show().attr("required", true); //Supplementary UM - CSL BI
        if ($("#SupplementaryUMCSLBINY_CHOICE").val() == "") {
          $("#SupplementaryUMCSLBINY_CHOICE").val("300000").trigger("change");
        }
        console.log("NY Statutory& Supplementary for single executed ");
      } else {
        console.log("NY Statutory& Supplementary for single hidden ");
        $("#question483126").hide().attr("required", false); //Statutory UM - CSL BI
        $("#question483962").hide().attr("required", false); //Supplementary UM - CSL BI
        $("#SupplementaryUMCSLBINY_CHOICE").val("").trigger("change");
      }
    }
    if (state === "New York") {
      if ($("#CovTypeValue").val() === "Split") {
        console.log("NY Statutory& Supplementary for split executed ");
        $("#question483963").show(); //Statutory UM - Bodily Injury
        $("#StatutoryUMBodilyInjury_TXT").attr("required", true);
        $("#question483965").show(); //Supplementary UM - Bodily Injury
        if ($("#SupplUMBodilyInjuryNY_CHOICE").val() == "") {
          $("#SupplUMBodilyInjuryNY_CHOICE").val("$25,000/$50,000").trigger("change");
        }
        $("#StatutoryUMBodilyInjury_TXT").val("$25,000/$50,000");
        console.log("9");
      } else {
        console.log("NY Statutory& Supplementary for split hidden ");
        $("#question483963").hide(); //Statutory UM - Bodily Injury
        $("#StatutoryUMBodilyInjury_TXT").attr("required", false);
        $("#question483965").hide().attr("required", false); //Supplementary UM - Bodily Injury
        $("#SupplUMBodilyInjuryNY_CHOICE").val("").trigger("change");
      }
    }
  }
  //Auto
  $("#CovTypeValue").on("change", function () {
    console.log("chagne event triggered,NYStatSuppCovType function called");
    NYStatSuppCovType();
  });
  // Adding as a part of BH-27326 and associated defect
  async function CheckLoanNumberInLossPayee() {
    try {
      showSpinner();
      if (
        !Instanda.Variables.IsRenewal &&
        !Instanda.Variables.IsMTA &&
        !Instanda.Variables.CreatedFromPCS_TXT == "Rewrite"
      ) {
        return;
      }
      if (
        !$(".page-postquotequestions.page-number-2.package-24337").length > 0
      ) {
        return;
      }
      if (!Instanda.Variables.OtherLossPayee_MI_Count > 0) {
        return;
      }
      const loanNumberFields = [
        ...$("input[name^='OtherLossPayeeLoanNumber1_TXT']"),
      ].filter(
        (input) =>
        input.value == "" && !input.id.startsWith("OtherLossPayee_MI0")
      );
      if (loanNumberFields.length > 0) {
        const response = await getQuoteData();
        const data = response.OtherLossPayee_MI;
        if (data) {
          data.forEach((v, i) => {
            $(loanNumberFields[i])
              .val(`${v.OtherLossPayeeLoanNumber1_NUM ?? ""}`)
              .trigger("change");
            $(
              `#li_OtherLossPayee_MI${i + 1}_OtherLossPayeeLoanNumber1_TXT`
            ).text(`${v.OtherLossPayeeLoanNumber1_NUM ?? ""}`);
          });
        }
      }
    } catch (error) {
      console.log("Error occured while updating loan number ", error);
    } finally {
      hideSpinner();
    }
  }
  CheckLoanNumberInLossPayee();

  //////////////////////////////////Default values and Display Conditions Covg Screen Auto End //////////////////////////////////
  //Funeral expenses dropdown
  //Auto
  function showDefaultFuneralExp() {
    // Run only on the correct page section
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    // Set up label variables and state
    var basicPipYes = $(`label:has(#BasicPIP_YNPYes)`);
    var basicPipNo = $(`label:has(#BasicPIP_YNPNo)`);
    var basicFirstPartyBenNo = $(`label:has(#BasicFirstPartyBen_CHOICEPNo)`);
    var basicFirstPartyBenYes = $(`label:has(#BasicFirstPartyBen_CHOICEPYes)`);
    var state = Instanda.Variables.PremiumState_CHOICE;

    // Hawaii logic
    if (state === "Hawaii") {
      document.getElementById("FuneralExpValue").value = "None";
      $("#FuneralExpValue").attr("required", true);
    }
    // PA, WA, KS, DC, UT logic
    else if (
      (state === "Pennsylvania" &&
        basicFirstPartyBenYes.hasClass("instanda-selected") &&
        basicFirstPartyBenNo.hasClass("instanda-unselected")) ||
      (basicPipYes.hasClass("instanda-selected") &&
        (basicPipNo.hasClass("instada-unselected") ||
          basicPipNo.hasClass("instanda-unselected")) &&
        (state === "Washington" ||
          state === "Kansas" ||
          state === "District Of Columbia" ||
          state === "Utah"))
    ) {
      $("#question482586").show();
      $("#FuneralExpValue").attr("required", true);

      if (state === "Washington" || state === "Kansas") {
        document.getElementById("FuneralExpValue").value = "$2,000";
        $("#question482586").addClass("readonly");
      } else if (state === "Utah") {
        document.getElementById("FuneralExpValue").value = "$1,500";
        $("#question482586").addClass("readonly");
      }
    } else {
      $("#question482586").hide();
      $("#FuneralExpValue").attr("required", false);
      $("#question482586").removeClass("readonly");
      $("#question482586 label .required-asterisk").remove();
    }
  }
  //Auto
  $(document).ready(function () {
    // Only attach handlers if correct page section exists
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    setTimeout(showDefaultFuneralExp, 2000);

    $("#question482487 .radio-inline input").on("change", function () {
      showDefaultFuneralExp();
    });

    $("#question482536 .radio-inline input").on("change", function () {
      showDefaultFuneralExp();
    });
  });

  //Funeral expenses for PA, OR, MN
  //Auto
  function funeralExpensesPAORMN() {
    // Only run on the relevant page section
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var basicpip = $("#question482487 .instanda-selected input").val();

    if (
      state === "Pennsylvania" &&
      $("#question482551 .instanda-selected input").val() === "Yes"
    ) {
      // PA: Render if 'Combination First Party Benefits' is 'Yes'
      $("#question482614").show().attr("required", true);
      $("#question482614 label").append(
        '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
      );
      $("#question482614 input").val(2500);
    } else if (
      (state === "Oregon" || state === "Minnesota") &&
      basicpip === "Yes"
    ) {
      // MN & OR: Render if 'Basic PIP' is 'Yes'
      $("#question482614").show().attr("required", true);
      $("#question482614 label").append(
        '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
      );
      if (state === "Oregon") {
        $("#question482614 input").val(5000);
      } else {
        // Minnesota
        $("#question482616").show().attr("required", true);
        $("#question482614 input").val(2000);
      }
    } else {
      $("#question482614").hide().attr("required", false);
      $("#question482614 label .required-asterisk").remove();
      $("#question482616").hide().attr("required", false);
    }
  }
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    funeralExpensesPAORMN();

    $("#question482551").on("change", function () {
      console.log(
        "funeralExpensesPAORMN function called",
        $("#question482551 .radio-inline input").val()
      );
      funeralExpensesPAORMN();
    });

    $("#question482487 .radio-inline input").on("change", function () {
      console.log(
        "funeralExpensesPAORMN function called",
        $("#question482487 .radio-inline input").val()
      );
      funeralExpensesPAORMN();
    });
  });

  //Show CSLBI
  //Auto
  function hideCSL() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    validState1 = [
      "Idaho",
      "Montana",
      "Kentucky",
      "Wisconsin",
      "North Dakota",
      "Arizona",
      "South Dakota",
      "Iowa",
      "Michigan",
      "Minnesota",
    ];
    validState2 = ["Indiana", "Arkansas"];
    validState3 = [
      "New Jersey",
      "Connecticut",
      "Illinois",
      "Indiana",
      "Minnesota",
      "North Dakota",
    ];
    validState4 = [
      "Illinois",
      "South Carolina",
      "Missouri",
      "District Of Columbia",
      "Ohio",
      "Utah",
    ];
    validState5 = ["Washington"];
    validState6 = ["Illinois", "Indiana", "Minnesota", "North Dakota"];
    validState7 = ["Pennsylvania"];
    const state = Instanda.Variables.PremiumState_CHOICE;
    const umTypeVal = $("#UMTypeValue").val();
    const covTypeVal = $("#CovTypeValue").val();
    $("#question483974").hide();
    $("#question483974").attr("required", false);
    $("#question483971").hide();
    $("#question483971").attr("required", false);
    if (validState1.includes(state) && umTypeVal == "CSL BI") {
      $("#question483974").show();
    }
    if (validState4.includes(state) && umTypeVal == "CSL") {
      $("#question483971").show();
    }
    if (
      validState2.includes(state) &&
      (umTypeVal === "CSL BI" || umTypeVal === "CSL")
    ) {
      $("#question483974").show();
    }
    if (
      validState3.includes(state) &&
      (covTypeVal === "Single" || covTypeVal === "Split")
    ) {
      $("#question483974").show();
      $("#question483974").attr("required", true);
    }
    if (
      validState6.includes(state) &&
      (covTypeVal === "Single" || covTypeVal === "Split")
    ) {
      $("#question483971").show();
      $("#question483971").attr("required", true);
      console.log("valid3");
    }
    if (validState5.includes(state) && covTypeVal === "Single") {
      $("#question483971").show();
      console.log("valid2");
    }
    if (validState7.includes(state) && umTypeVal == "Single") {
      $("#question483974").show();
    }
  }
  //Auto
  $(document).ready(function () {
    // Only run if the correct page section is present
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    hideCSL();

    $("#question483032").on("change", function () {
      console.log("input changes function called", $("#UMTypeValue").val());
      hideCSL();
    });

    $("#question482293").on("change", function () {
      console.log("input changes function called", $("#CovTypeValue").val());
      hideCSL();
    });
  });

  /////////////////////////////////////////////////////////////
  //Auto
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    $("#question488359 label").each(function () {
      if ($(this).find(".required-asterisk").length === 0) {
        $(this).append(
          '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
        );
      }
    });

    $("#question488374 .control-label").each(function () {
      if ($(this).find(".required-asterisk").length === 0) {
        $(this).append(
          '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
        );
      }
    });
  }

  //Auto
  function hideRehabilitationExpenses() {
    // Only run if on the specific page section
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    if (state === "Kansas") {
      if ($("#question482487 .instanda-selected input").val() === "Yes") {
        $("#question482479").show().attr("required", true);
      } else {
        $("#question482479").hide().attr("required", false);
      }
    }
  }
  //Auto
  $(document).ready(function () {
    // Only bind event handler if page section exists
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    $("#question482487 .instanda-selected input").on("change", function () {
      console.log(
        "change event triggered,hideRehabilitationExpenses function called"
      );
      hideRehabilitationExpenses();
    });

    // Optionally, initialize the visibility on load
    hideRehabilitationExpenses();
  });

  //show PIP Deductible
  //Auto
  function showPIPDed() {
    // Only execute if the correct page section is on the DOM
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    const state = Instanda.Variables.PremiumState_CHOICE;
    const BasicPIPval = $("#BasicPIPKY_CHOICEP").val();
    const PIPVeh = Instanda.Variables.PIPDedVeh_SUM;

    if (state === "") {
      return; // Do nothing if the state is empty
    }

    if (state === "Kentucky" && BasicPIPval === "Guest") {
      $("#question484327").val("");
      $("#question484327").addClass("readonly");
    } else {
      $("#question484327").removeClass("readonly");
    }

    /*
    if (state === "New Jersey" && PIPVeh > 0) {
      $("#PIPDeductVal_TXT").attr("required", true);
      // Add red asterisk to the label of the parent question
      $("#question484327 label").append(
        '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
      );
    } else {
      $("#PIPDeductVal_TXT").attr("required", false);
      // Remove red asterisk if it exists
      $("#question432710 label .required-asterisk").remove();
    }
      */
  }
  //Auto
  $(document).ready(function () {
    // Only run if on the right page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    showPIPDed();

    $("#question482574").on("change", function () {
      showPIPDed();
    });
  });

  //Auto
  // BH -26230 Make PIP deductible required for certain states
  function makePIPDedRequired() {
    const selectiveStates = [
      "Delaware",
      "Florida",
      "Hawaii",
      "New Jersey",
      "New York",
      "Oregon",
    ];
    const premiumState = Instanda.Variables.PremiumState_CHOICE;
    if (!selectiveStates.includes(premiumState)) return;

    const covType = document.querySelector("#CovTypeValue");
    const PIPDedField = document.querySelector("#PIPDeductVal_TXT");
    const parentQuestion = PIPDedField.closest(".questionItem");
    const questionLabel = parentQuestion.querySelector("div label");
    if (
      covType &&
      covType.value !== "Physical Damage Only" &&
      PIPDedField &&
      questionLabel
    ) {
      PIPDedField.required = true;
      if (!questionLabel.querySelector(".required-asterisk")) {
        const requiredMark = document.createElement("span");
        requiredMark.classList.add("required-asterisk");
        requiredMark.innerText = " *";
        requiredMark.style.color = "red";
        requiredMark.style.fontSize = "16px";
        questionLabel.append(requiredMark);
      }
    } else if (PIPDedField && questionLabel) {
      PIPDedField.required = false;
      questionLabel
        .querySelectorAll(".required-asterisk")
        .forEach((ele) => ele.remove());
    }
  }

  $(document).ready(function () {
    // Only execute if the targeted page section is present
    if (
      $(".page-quickquotequestions.page-number-6.package-24338").length === 0
    ) {
      return;
    }

    setTimeout(makePIPDedRequired, 10);
    document
      .querySelector("#CovTypeValue")
      .addEventListener("change", makePIPDedRequired);

    // Utility to set the CSL dropdown value (doesn't change if already set appropriately)
    function setCSLLimitValue(desiredValue) {
      var $cslLimit = $("#CSLLimit");
      var matchedOption = $cslLimit.find("option").filter(function () {
        return $(this).val().trim() === desiredValue.trim();
      });
      if (matchedOption.length) {
        $cslLimit.val(matchedOption.val()).trigger("change");
      } else {
        // Default to the first option ("Please select")
        var defaultValue = $cslLimit.find("option:first").val();
        $cslLimit.val(defaultValue).trigger("change");
      }
    }

    // Show/hide and set value for the CSL question based on state and coverage type
    function showCSL() {
      var state = Instanda.Variables.PremiumState_CHOICE || "";
      var validStates = [
        "New Jersey",
        "Wyoming",
        "Hawaii",
        "North Carolina",
        "Kansas",
        "West Virginia",
      ];
      var isInvalidState = validStates.includes(state);

      var $questionCSL = $("#question482456");
      var $cslLimit = $("#CSLLimit");
      var $covType = $("#CovTypeValue");

      // Defensive DOM check
      if (
        $questionCSL.length === 0 ||
        $cslLimit.length === 0 ||
        $covType.length === 0
      ) {
        console.error(
          "One or more required elements are missing from the DOM."
        );
        return;
      }

      // If state or coverage type is empty, just hide and remove required, but don't reset value
      if (state === "" || $covType.val() === "") {
        $questionCSL.hide();
        $cslLimit.attr("required", false);
        return;
      }

      // Only show for states NOT in validStates and coverage type 'Single'
      if (!isInvalidState && $covType.val().trim() === "Single") {
        $questionCSL.show();
        $cslLimit.attr("required", true);

        // Only set value if it's empty, "Please select", or an invalid value
        var currentValue = $cslLimit.val();
        if (
          !currentValue ||
          currentValue === "Please select" ||
          !$cslLimit.find("option[value='" + currentValue + "']").length
        ) {
          if (state.trim() === "Michigan") {
            setCSLLimitValue("$510,000");
          } else if (state.trim() === "Texas") {
            setCSLLimitValue("$325,000");
          } else {
            setCSLLimitValue("$300,000");
          }
        }
      } else {
        $questionCSL.hide();
        $cslLimit.attr("required", false);
        // To force a reset when hiding, uncomment the next line:
        // setCSLLimitValue("");
      }
    }

    // Initial evaluation on page load
    showCSL();

    // Bind change event to coverage type
    $("#CovTypeValue").on("change", function () {
      console.log(
        "input changes function called for showing/Hiding CSL",
        $(this).val()
      );
      showCSL();
    });
  });

  //Auto
  $(document).ready(function () {
    // Only proceed if on the correct page!
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function lawsuitLim() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      const covType = $("#CovTypeValue").val();
      const policyType = Instanda.Variables.PolicyType_CHOICE;

      $("#question482454").show();

      if (state === "New Jersey") {
        if (policyType === "BASIC") {
          // If 'Policy Type' field is set to 'Basic'
          // Then Set value of 'Lawsuit Limitation' field = 'Yes' and disable
          console.log("2");
          $("#question482454").show();
          $("#question482454").attr("required", true);

          // Set radio button and classes
          var firstLabel = $("label:has(#LawsuitLim_YNYes)");
          var lastLabel = $("label:has(#LawsuitLim_YNNo)");
          $("#question482454").addClass("readonly");
          firstLabel.trigger("click");
          firstLabel
            .addClass("instanda-selected")
            .removeClass("instanda-unselected");
          lastLabel
            .addClass("instanda-unselected")
            .removeClass("instanda-selected");
        }
        if (covType === "Physical Damage Only") {
          // If 'Physical Damage Only' Then Hide 'Lawsuit Limitation'
          $("#question482454").hide();
          $("#question482454").attr("required", false);
          $("#question482454").removeClass("readonly");
          console.log("1");
        }
      }
    }

    // Initial call
    lawsuitLim();

    // Bind to change/select event for CovTypeValue
    $("#CovTypeValue").on("change select", function () {
      console.log("Toggle Lawsuit limitation", $("#CovTypeValue").val());
      lawsuitLim();
    });
  });

  // ready for paste
  //Auto
  $(document).ready(function () {
    // Only run logic on the correct page/package
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function showPropDamageCov() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var covType = $("#CovTypeValue").val();
      var policyType = Instanda.Variables.PolicyType_CHOICE;

      //Commnted this below code in ref to BH-28499
      // if (state === "New Jersey" && policyType === "BASIC") {
      //   $("#question483601").hide();
      //   $("#question483601").attr("required", false);
      //   $("#question483601 label .required-asterisk").remove();
      //   return;
      // }

      if (covType === "Split") {
        // Show Property Damage and mark required
        $("#question483601").show();
        $("#question483601").attr("required", true);

        $("#question483601 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });

        if (policyType === "BASIC") {
          if (!$("#PDLimitValue").val()) $("#PDLimitValue").val("$25,000.00");
        }
      } else {
        $("#question483601").hide();
        $("#question483601").attr("required", false);
        $("#question483601 label .required-asterisk").remove();
      }
    }

    // Call once on page load to set initial state
    showPropDamageCov();

    // Call on coverage type change
    $("#CovTypeValue").on("change", function () {
      console.log("input changes function called", $("#CovTypeValue").val());
      showPropDamageCov();
    });
  });

  //Auto
  function setDefBodilyInj() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var policyType = Instanda.Variables.PolicyType_CHOICE;

    if (state === "" || state === "New Hampshire") return;

    if ($("#CovTypeValue").val() === "Split") {
      if (state === "New Jersey") {
        if (policyType === "BASIC") {
          $("#question483587").show();
          $("#BodilyInjValueNJ").attr("required", false);
          if (!$("#BodilyInjValueNJ").val()) {
            $("#BodilyInjValueNJ").val("$25,000");
          }
          $("#question483587 label .required-asterisk").remove();
        } else {
          $("#question483587").show();
          $("#BodilyInjValueNJ").attr("required", true);
          if (!$("#BodilyInjValueNJ").val()) {
            $("#BodilyInjValueNJ").val("$250,000/$500,000");
          }
          $("#question483587 label").each(function () {
            if ($(this).find(".required-asterisk").length === 0) {
              $(this).append(
                '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
              );
            }
          });
        }
      }
      if (state === "Florida") {
        $("#question483594").show();
        $("#BodilyInjValueOtStates").attr("required", false);
        $("#question483594 label .required-asterisk").remove();
      } else if (state !== "New Jersey") {
        $("#question483594").show();
        $("#BodilyInjValueOtStates").attr("required", true);
        if (!$("#BodilyInjValueOtStates").val())
          $("#BodilyInjValueOtStates").val("$250,000/$500,000");
        $("#question483594 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
      }
    } else if (state !== "New Jersey") {
      $("#question483594").hide();
      $("#BodilyInjValueOtStates").val("");
      $("#BodilyInjValueOtStates").attr("required", false);
      $("#question483594 label .required-asterisk").remove();
    } else {
      $("#question483587").hide();
      $("#BodilyInjValueNJ").val("");
      $("#BodilyInjValueNJ").attr("required", false);
      $("#question483587 label .required-asterisk").remove();
    }
  }

  //Auto
  // Bind logic once page section is present
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    setTimeout(() => {
      safeRun(setDefBodilyInj);
    }, 200);

    $("#CovTypeValue").on("change select", function () {
      console.log("execute setDefBodilyInj", $(this).val());
      safeRun(setDefBodilyInj);
    });
  }

  //Additional PIP combined limit
  //Auto
  $(document).ready(function () {
    // Only enable logic on this specific page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function showAdditionalPIPCombinedLimit() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var policyType = Instanda.Variables.PolicyType_CHOICE;
      var excludeWorkLoss = $("#ExcludeWorkLossFL_CHOICE").val();
      var pipded = $("#PIPDeductVal_TXT").val();
      var basicpipCL = $("#BasicPIPCLTX_NUM").val();

      if (state === "") return;

      if (state === "Texas") {
        // BH-26986
        $("#question483888").show();
        $("#APIPCombinedVal").val("None");
        $("#question483888 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0)
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
        });
        $("#APIPCombinedVal").attr("required", true);
        if (basicpipCL === "Reject") $("#question483888").addClass("readonly");
        else $("#question483888").removeClass("readonly");
      } else if (
        state === "Florida" &&
        (pipded === "" ||
          $("#question483886 .instanda-selected input").val() === "Yes" ||
          $("#question483887 .instanda-selected input").val() === "Yes")
      ) {
        $("#question483888").show();
        $("#APIPCombinedVal").attr("required", true);
        $("#question483888").removeClass("readonly");
        $("#question483888 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0)
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
        });
      } else if (state === "New York") {
        $("#question483888").show();
        $("#APIPCombinedVal").attr("required", true);
        $("#question483888").removeClass("readonly");
        $("#question483888 label").each(function () {
          if ($(this).find(".required-asterisk").length === 0)
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
        });
      } else {
        $("#question483888").hide();
        $("#APIPCombinedVal").attr("required", false);
        $("#question483888").removeClass("readonly");
        $("#question483888 label .required-asterisk").remove();
      }
    }

    // Initial run
    showAdditionalPIPCombinedLimit();

    // Event bindings -- only within correct page
    $("#BasicPIPCLTX_NUM").on("change select", function () {
      console.log("Toggle Additional PIP, Combined Limit", $(this).val());
      showAdditionalPIPCombinedLimit();
    });
    $("#PIPDeductVal_TXT").on("change select", function () {
      console.log("Toggle Additional PIP, Combined Limit", $(this).val());
      showAdditionalPIPCombinedLimit();
    });
    $("#question483886 .radio-inline input").on("change", function () {
      console.log("Toggle Additional PIP, Combined Limit", $(this).val());
      showAdditionalPIPCombinedLimit();
    });
    $("#question483887 .radio-inline input").on("change", function () {
      console.log("Toggle Additional PIP, Combined Limit", $(this).val());
      showAdditionalPIPCombinedLimit();
    });
  });

  //set default values for medical expenses num field for MN
  //Auto
  $(document).ready(function () {
    // Only activate logic/events for the designated quickquote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function setMedExpMN() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var overallAgg = $("#OverAggMN_NUM").val();

      if (state !== "Minnesota" || overallAgg === "") return;

      var medExpValue;
      switch (parseInt(overallAgg)) {
        case 50000:
          medExpValue = 30000;
          break;
        case 60000:
          medExpValue = 40000;
          break;
        case 70000:
        case 85000:
          medExpValue = 50000;
          break;
        case 110000:
          medExpValue = 75000;
          break;
        case 160000:
          medExpValue = 100000;
          break;
        default:
          medExpValue = null;
      }
      $("#question482641 input").val(medExpValue);
    }

    // Initial logic run
    setMedExpMN();

    // Bind to selector only if page present
    $("#OverAggMN_NUM").on("change", function () {
      console.log("setMedExpMN function called", $(this).val());
      setMedExpMN();
    });
  });

  //Set Rehabilitation Expenses, Work Loss, Essential Services, Funeral Expenses, Survivors Loss, Survivor's Benefits
  //Auto
  $(document).ready(function () {
    // Only run on relevant page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function setValuesRelToAddedPIP() {
      const state = Instanda.Variables.PremiumState_CHOICE;
      const overallAgg = $("#OverAggMN_NUM").val();
      const medExpVal = $("#MedExpValChoice").val();
      const medExp = medExpVal ? medExpVal.trim() : "";

      var workLossValue = null;
      var rehabExpValue = null;
      var essentialServicesValue = null;
      var funeralExpensesValue = null;
      var disableFuneralExpenses = false;
      var survivorsLossValue = null;
      var survivorsBenefitsValue = null;

      if (state === "Minnesota") {
        if (overallAgg !== "") {
          if (parseInt(overallAgg) <= 70000) {
            workLossValue = 250;
            essentialServicesValue = 200;
            survivorsBenefitsValue = 200;
          }
          if (parseInt(overallAgg) == 85000 || parseInt(overallAgg) == 110000) {
            survivorsBenefitsValue = 300;
          }
          if (parseInt(overallAgg) == 160000) {
            survivorsBenefitsValue = 400;
          }
          if (parseInt(overallAgg) > 70000) {
            workLossValue = 450;
            essentialServicesValue = 300;
          }
        }
        funeralExpensesValue = 2000;
      } else if (state === "Kansas") {
        if (medExp !== "") {
          if (medExp == "$12,500") {
            workLossValue = 1050;
            funeralExpensesValue = 2000;
            survivorsLossValue = 1050;
            rehabExpValue = 12500;
          } else if (medExp == "$27,500") {
            workLossValue = 1250;
            funeralExpensesValue = 2500;
            survivorsLossValue = 1250;
            rehabExpValue = 27500;
          } else {
            rehabExpValue = null;
          }
        }
        essentialServicesValue = 25;
      } else if (state === "Utah") {
        if (medExp !== "") {
          if (medExp == "$5,000") {
            workLossValue = 300;
          } else if (medExp == "$10,000") {
            workLossValue = 350;
          }
        }
        essentialServicesValue = 20;
        funeralExpensesValue = 1500;
        disableFuneralExpenses = true;
        survivorsLossValue = 3000;
      } else {
        workLossValue = null;
        rehabExpValue = null;
        essentialServicesValue = null;
        funeralExpensesValue = null;
        survivorsLossValue = null;
        survivorsBenefitsValue = null;
      }

      // if (!$("#question483116 input").val())
      //   $("#question483116 input").val(workLossValue);
      // if (!$("#question482668 input").val())
      //   $("#question482668 input").val(rehabExpValue);
      // if (!$("#question483121 input").val())
      //   $("#question483121 input").val(essentialServicesValue);
      // if (!$("#question483128 input").val())
      //   $("#question483128 input").val(funeralExpensesValue);
      // if (!$("#question483130 input").val())
      //   $("#question483130 input").val(survivorsLossValue);
      // if (!$("#question483131 input").val())
      //   $("#question483131 input").val(survivorsBenefitsValue);

      $("#question483116 input").val(workLossValue);
      $("#question482668 input").val(rehabExpValue);
      $("#question483121 input").val(essentialServicesValue);
      $("#question483128 input").val(funeralExpensesValue);
      $("#question483130 input").val(survivorsLossValue);
      $("#question483131 input").val(survivorsBenefitsValue);

      if (disableFuneralExpenses) {
        $("#question483128").addClass("readonly");
      } else {
        $("#question483128").removeClass("readonly");
      }
      console.log("State:", state);
    }

    // Initial population
    setValuesRelToAddedPIP();

    // Event listeners to update values on change
    $("#OverAggMN_NUM, #MedExpValChoice").on("change select", function () {
      setValuesRelToAddedPIP();
    });

    $('input[name="AddedPIPOTStates_YNP"]').on("change", function () {
      setValuesRelToAddedPIP();
    });
  });

  //set default values for medical expenses num field for MN
  //Auto
  $(document).ready(function () {
    // Only run on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function setMedExpMN() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var overallAgg = $("#OverAggMN_NUM").val();

      if (state !== "Minnesota" || overallAgg === "") return;

      var medExpValue;
      switch (parseInt(overallAgg)) {
        case 50000:
          medExpValue = 30000;
          break;
        case 60000:
          medExpValue = 40000;
          break;
        case 70000:
        case 85000:
          medExpValue = 50000;
          break;
        case 110000:
          medExpValue = 75000;
          break;
        case 160000:
          medExpValue = 100000;
          break;
        default:
          medExpValue = null;
      }
      $("#question482641 input").val(medExpValue);
    }

    // Initial setting on page load
    setMedExpMN();

    // React to changes in aggregate
    $("#OverAggMN_NUM").on("change", function () {
      console.log("setMedExpMN function called", $(this).val());
      setMedExpMN();
    });
  });

  //Added PIP, Work Loss/Week/Person and Added PIP, Replacement Services
  //Auto
  $(document).ready(function () {
    // Ensure scoping to the correct page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function setPIPDefaultsWorkLossReplServ() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var aggregateLimit = $("#AddedPIPAggLim_CHOICE").val();

      let workLossPerWeek = null;
      let replacementServices = null;

      if (state === "North Dakota") {
        if (aggregateLimit == 40000) {
          workLossPerWeek = 15;
          replacementServices = 250;
        } else if (aggregateLimit > 40000) {
          workLossPerWeek = 25;
          replacementServices = 350;
        }
      }

      if (!$("#question483134 input").val())
        $("#question483134 input").val(workLossPerWeek);
      if (!$("#question483136 input").val())
        $("#question483136 input").val(replacementServices);
    }

    // Run on initial page load
    setPIPDefaultsWorkLossReplServ();

    // React to aggregate limit changes
    $("#AddedPIPAggLim_CHOICE").on("change", function () {
      console.log(
        "setPIPDefaultsWorkLossReplServ function called",
        $(this).val()
      );
      setPIPDefaultsWorkLossReplServ();
    });
  });

  //accidental death ben default values for PA
  //Auto
  $(document).ready(function () {
    // Only run logic on the designated quickquote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function getAccidentalDeathBenefitPA() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var totalBenefitLimit = $("#TotBenLimPA_CHOICE").val();

      if (state === "Pennsylvania") {
        if (totalBenefitLimit === "50000" || totalBenefitLimit === "100000") {
          if (!$("#question482726 input").val())
            $("#question482726 input").val(10000);
        } else if (totalBenefitLimit === "177500") {
          if (!$("#question482726 input").val())
            $("#question482726 input").val(25000);
        } else if (totalBenefitLimit === "") {
          if (!$("#question482668 input").val())
            $("#question482726 input").val(null);
        }
      } else {
        // Clear the value if not Pennsylvania
        $("#question482726 input").val(null);
      }
    }

    // Initial run when page loads
    getAccidentalDeathBenefitPA();

    // Event listener: update benefit value on change/select
    $("#TotBenLimPA_CHOICE").on("change select", function () {
      getAccidentalDeathBenefitPA();
    });
  });

  //Bodily Injury 0248 Uninsured
  //Auto
  $(document).ready(function () {
    // Scope logic to the correct Quick Quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function BodilyInjury() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      var covTypeVal = $("#CovTypeValue").val();
      var umTypeVal = $("#UMTypeValue").val();
      var BodilyInjuryVal = $("#BodilyInjValueOtStates").val();
      var NamedNO = Instanda.Variables.NamedNonOwnPol_YN;

      // List of states with 'Split UM Type' exclusion
      var splitUmExclusions = [
        "New York",
        "North Dakota",
        "Nevada",
        "Nebraska",
        "New Hampshire",
        "South Dakota",
        "Maine",
        "Washington",
      ];

      // Render 'Bodily Injury' if not in splitUmExclusions and UM Type is 'Split'
      if (!splitUmExclusions.includes(state)) {
        if (umTypeVal === "Split") {
          $("#question483066").show();
          $("#UMBILimitVal").attr("required", true);
        } else {
          $("#question483066").hide();
          $("#UMBILimitVal").attr("required", false);
        }
      }

      // New Jersey: Special rules for BASIC policy type
      if (state === "New Jersey") {
        if (Instanda.Variables.PolicyType_CHOICE === "BASIC") {
          $("#question483066").hide();
          $("#UMBILimitVal").attr("required", false);
          $("#question483032").hide();
        } else {
          $("#question483066").show();
          $("#UMBILimitVal").attr("required", true);
          $("#question483032").show();
        }
      }

      // Pennsylvania: Show for 'Split' or 'Single' UM types
      if (state === "Pennsylvania") {
        if (umTypeVal === "Split") {
          $("#question483066").show();
          $("#UMBILimitVal").attr("required", true);
        } else {
          $("#question483066").hide();
          $("#UMBILimitVal").attr("required", false);
        }
      }

      // North Carolina: Default scenario for specific combination
      if (
        state === "North Carolina" &&
        NamedNO === "No" &&
        covTypeVal === "Split" &&
        BodilyInjuryVal === "$250,000/$500,000"
      ) {
        if (!$("#UIMBILimitVal").val()) $("#UIMBILimitVal").val("$250,000 ");
      }
    }

    // Initial run
    BodilyInjury();

    // Event listeners for refresh on relevant field changes
    $("#question483032, #question483594, #question482293").on(
      "change",
      function () {
        BodilyInjury();
      }
    );
  });

  //Show Uninsured/Underinsured -P
  //Auto
  $(document).ready(function () {
    // Only apply on the specific target page for quoting
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    const UNUM = () => {
      console.log("Inside func UNUM");

      // DOM element references
      const $question483969 = $("#question483969");
      const $UMUIMTypeValue = $("#UMUIMTypeValue");
      const state = Instanda.Variables.PremiumState_CHOICE;
      const covTypeVal = $("#CovTypeValue").val();
      const umTypeVal = $("#UMTypeValue").val();
      const NamedNO = Instanda.Variables.NamedNonOwnPol_YN;
      const BodilyInjury = $("#BodilyInjValueOtStates").val();

      // If UM Type is empty, hide and unset required
      if (!umTypeVal) {
        $question483969.hide();
        $UMUIMTypeValue.attr("required", false);
        return;
      }

      // Show/Hide logic based on state and UM Type value
      const shouldShowUMUIM =
        (state === "Louisiana" &&
          (umTypeVal === "Split" || umTypeVal === "CSL BI")) ||
        (state === "North Carolina" && umTypeVal === "Split");

      if (shouldShowUMUIM) {
        $question483969.show();
        $UMUIMTypeValue.attr("required", true);
      } else {
        $question483969.hide();
        $UMUIMTypeValue.attr("required", false);
      }

      // North Carolina auto-default scenario for UM/UIM
      if (
        state === "North Carolina" &&
        NamedNO === "No" &&
        covTypeVal === "Split" &&
        BodilyInjury === "$250,000/$500,000"
      ) {
        $UMUIMTypeValue.val("UM/UIM");
      }
    };

    // Run on initial page load
    UNUM();

    // Bind to field changes
    $("#question483032, #question482293, #question483594").on("change", UNUM);
  });

  //stacked
  //Auto
  $(document).ready(function () {
    // Ensure this logic runs only on the quote page you target
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function stacked() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      const umTypeVal = $("#UMTypeValue").val();
      const VehCnt = Number(Instanda.Variables.Vehicle_MI_Count); // Ensure numeric check
      const NamedNO = Instanda.Variables.NamedNonOwnPol_YN;

      var stackedY = $(`label:has(#Stacked_YNYes)`);
      var stackedN = $(`label:has(#Stacked_YNNo)`);
      var $stackedQ = $("#question483123");

      // Display logic for selected states and UM Type
      if (
        [
          "Florida",
          "Colorado",
          "Mississippi",
          "Pennsylvania",
          "Oklahoma",
          "Hawaii",
          "New Mexico",
        ].includes(state)
      ) {
        if (["Split", "CSL", "CSL BI", "Single"].includes(umTypeVal)) {
          $stackedQ.show();
          $stackedQ.attr("required", false); // Not required
        } else {
          $stackedQ.hide();
          $stackedQ.attr("required", false);
        }
      } else {
        $stackedQ.hide();
        $stackedQ.attr("required", false);
      }

      // Disable and set "No" for Named Non-Owner in PA
      if (state === "Pennsylvania" && NamedNO === "Yes") {
        $stackedQ.addClass("readonly");
        stackedN.trigger("click");
        stackedY
          .addClass("instanda-unselected")
          .removeClass("instanda-selected");
        stackedN
          .addClass("instanda-selected")
          .removeClass("instanda-unselected");
      } else if (
        state === "Oklahoma" ||
        state === "Colorado" ||
        (state === "Colorado" && VehCnt === 1)
      ) {
        // Disable and set "No" for OK, always for CO, and for CO if only 1 vehicle
        $stackedQ.addClass("readonly");
        stackedN.trigger("click");
        stackedY
          .addClass("instanda-unselected")
          .removeClass("instanda-selected");
        stackedN
          .addClass("instanda-selected")
          .removeClass("instanda-unselected");
      } else {
        $stackedQ.removeClass("readonly");
      }
    }

    // Initial run on page load
    stacked();

    // Re-run on field changes that might impact logic
    $("#question483032").on("change", function () {
      stacked();
    });
  });

  //show PD Deductible
  //Auto
  $(document).ready(function () {
    // Only run logic on the specified quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function PDDeduc() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      const umTypeVal = $("#UMTypeValue").val();
      const PropDamage = $("#UMPDLimitValue").val();
      var $pdDeductibleQ = $("#question483120");

      // Hide/show logic for "all except" state list
      const excludedStates = [
        "New York",
        "Florida",
        "California",
        "Connecticut",
        "Idaho",
        "Alabama",
        "Texas",
        "Missouri",
        "Montana",
        "Indiana",
        "Wyoming",
        "Mississippi",
        "Pennsylvania",
        "Kentucky",
        "District Of Columbia",
        "Wisconsin",
        "Oklahoma",
        "North Dakota",
        "Nevada",
        "Nebraska",
        "Hawaii",
        "Arizona",
        "New Hampshire",
        "Maryland",
        "Ohio",
        "Arkansas",
        "Oregon",
        "South Dakota",
        "Maine",
        "Iowa",
        "North Carolina",
        "Washington",
        "Kansas",
        "Minnesota",
        "Michigan",
        "West Virginia",
        "Alaska",
        "Vermont",
        "New Mexico",
      ];

      if (!excludedStates.includes(state)) {
        if (PropDamage !== "") {
          $pdDeductibleQ.show();
          $pdDeductibleQ
            .find("input, select, textarea")
            .prop("disabled", false);
        } else {
          $pdDeductibleQ.hide();
          $pdDeductibleQ.find("input, select, textarea").prop("disabled", true);
        }
      }

      // Georgia logic: Show only if UM Type is Split
      if (state === "Georgia") {
        if (umTypeVal === "Split") {
          $pdDeductibleQ.show();
          $pdDeductibleQ
            .find("input, select, textarea")
            .prop("disabled", false);
        } else {
          $pdDeductibleQ.hide();
          $pdDeductibleQ.find("input, select, textarea").prop("disabled", true);
        }
      }

      // Indiana logic: PropDamage selected OR UM Type is CSL
      if (state === "Indiana") {
        if (PropDamage !== "" || umTypeVal === "CSL") {
          $pdDeductibleQ.show();
          $pdDeductibleQ
            .find("input, select, textarea")
            .prop("disabled", false);
        } else {
          $pdDeductibleQ.hide();
          $pdDeductibleQ.find("input, select, textarea").prop("disabled", true);
        }
      }

      // IL, NJ, DE: Make mandatory and show red asterisk
      if (["Illinois", "New Jersey", "Delaware"].includes(state)) {
        $pdDeductibleQ.attr("required", true);
        $pdDeductibleQ.find("label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
      }

      // IN, CO, TN, SC, RI, VA, UT, GA: Make optional and remove asterisk if present
      if (
        [
          "Indiana",
          "Colorado",
          "Tennessee",
          "South Carolina",
          "Rhode Island",
          "Virginia",
          "Utah",
          "Georgia",
        ].includes(state)
      ) {
        $pdDeductibleQ.attr("required", false);
        $pdDeductibleQ.find("label .required-asterisk").remove();
      }

      // LA: Auto default and disable if PropDamage selected
      if (state === "Louisiana") {
        if (PropDamage !== "") {
          $("#UMPDDeductibleVal").val("$250");
          $pdDeductibleQ.addClass("readonly");
        } else {
          $pdDeductibleQ.removeClass("readonly");
        }
      } else {
        $pdDeductibleQ.removeClass("readonly");
      }
    }

    // Initial run
    PDDeduc();

    // Bind to change events that may trigger recalculation
    $("#question483032").on("change", function () {
      PDDeduc();
    });
    $("#question483960").on("change", function () {
      PDDeduc();
    });
  });

  //default Bodily Injury and Property Damage for North Carolina start
  function defaultBodInjAndPropDamForNC() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    const premiumState = Instanda.Variables.PremiumState_CHOICE;
    const namedNonOwner = Instanda.Variables.NamedNonOwnPol_YN;
    const covgType = $("#CovTypeValue").val();
    const bodilyInjury = $("#BodilyInjValueOtStates").val();
    var bodilyInjuryUM = $("#UMBILimitVal");
    var propDamageUM = $("#UMPDLimitValue");

    // Only set values if UMPDLimitValue is empty (null, undefined, or "")
    function isInputEmpty(elem) {
      const val = elem.val();
      return val === null || val === undefined || val === "";
    }

    if (
      covgType === "Split" &&
      namedNonOwner === "No" &&
      premiumState === "North Carolina" &&
      bodilyInjury === "$250,000/$500,000"
    ) {
      // Only apply default if property damage is empty
      if (isInputEmpty(propDamageUM)) {
        bodilyInjuryUM.val(bodilyInjury);
        propDamageUM.val("$250,000");
      }
    }
  }
  //default Bodily Injury and Property Damage for North Carolina end

  //function to hide UM ONLY option if effective date is greater than or equal to 30th June 2025 start
  function hideUMOnlyOptionForExpiredDate() {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    var effDate = Instanda.Variables.EffectiveDate_DATE;
    var expDate = new Date("2025-06-30").toLocaleDateString();
    var expDateAltEcoLoss = new Date("2025-07-01").toLocaleDateString();
    const selectElement = document.getElementById("UMUIMTypeValue");
    const valueToRemove = "UM ONLY";
    const altEcoLossField = $("#question483310");

    if (effDate >= expDate) {
      for (let i = 0; i < selectElement.options.length; i++) {
        if (selectElement.options[i].value === valueToRemove) {
          selectElement.remove(i);
          break;
        }
      }
    }
    if (effDate >= expDateAltEcoLoss) {
      altEcoLossField.hide();
    }
  }
  //function to hide UM ONLY option if effective date is greater than or equal to 30th June 2025 end

  //Property Damage -- P
  ///////////////////////////////////Property Damage
  //Common
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  //Auto
  $(document).ready(function () {
    // Ensure logic only runs on the designated page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    // Simple debounce utility for event handling
    function debounce(func, wait) {
      let timeout;
      return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
      };
    }

    function PropertyDamage() {
      // Cache variables and elements
      const $question = $("#question483960");
      const $umpdLimit = $("#UMPDLimitValue");
      const state = Instanda?.Variables?.PremiumState_CHOICE || "";
      const umTypeVal = $("#UMTypeValue").val() || "";
      const namedNO = Instanda?.Variables?.NamedNonOwnPol_YN || "";
      const bodilyInjury = $("#BodilyInjValueOtStates").val() || "";
      const covTypeVal = $("#CovTypeValue").val() || "";
      const policyType = Instanda?.Variables?.PolicyType_CHOICE || "";
      const $umpdYes = $("label:has(#UMPDRejectCA_YNYes)");
      const $umpdNo = $("label:has(#UMPDRejectCA_YNNo)");

      // Bail if critical elements missing
      if (!$question.length || !$umpdLimit.length) return;
      if (!state) return;

      // Helper functions
      const showField = () => $question.show();
      const hideField = () => $question.hide();
      const makeOptional = () => {
        $question.attr("required", false);
        $question.find("label .required-asterisk").remove();
      };
      const makeRequired = () => {
        $question.attr("required", true);
        $question.find("label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
      };
      const setValue = (value) => $umpdLimit.val(value);
      const setReadOnly = (isReadOnly) =>
        $question.toggleClass("readonly", isReadOnly);

      // State-specific logic containers
      const stateRules = {
        California: () => {
          showField();
          if (umTypeVal === "Split") setValue("$3,500");
          if (umTypeVal === "CSL") showField();
          if (
            $umpdYes.hasClass("instanda-selected") &&
            $umpdNo.hasClass("instanda-unselected")
          ) {
            makeOptional();
            setValue("");
            setReadOnly(true);
          } else {
            setReadOnly(false);
          }
          makeOptional();
        },
        "North Carolina": () => {
          showField();
          if (namedNO === "No") {
            makeRequired();
            if (
              covTypeVal === "Split" &&
              bodilyInjury === "$250,000/$500,000"
            ) {
              setValue("$250,000");
            }
          } else {
            makeOptional();
          }
        },
        "New Jersey": () => {
          if (policyType === "BASIC") {
            hideField();
            makeOptional();
          } else {
            showField();
            makeOptional();
          }
        },
        Louisiana: () => {
          if (umTypeVal === "CSL BI") showField();
          makeOptional();
        },
        optionalStates: [
          "Rhode Island",
          "Oregon",
          "Arkansas",
          "Vermont",
          "New Mexico",
          "Alaska",
          "Colorado",
          "Texas",
          "Illinois",
          "Tennessee",
          "South Carolina",
          "Georgia",
          "Indiana",
          "Mississippi",
          "District Of Columbia",
          "Maryland",
          "Ohio",
          "Hawaii",
          "Utah",
          "West Virginia",
        ],
        cslBIStates: [
          "Rhode Island",
          "Oregon",
          "Arkansas",
          "Vermont",
          "New Mexico",
          "Alaska",
          "Colorado",
        ],
        cslStates: ["Ohio", "Utah"],
        excludedStates: [
          "New York",
          "Florida",
          "Connecticut",
          "Idaho",
          "Alabama",
          "Missouri",
          "Montana",
          "Wyoming",
          "Pennsylvania",
          "Kentucky",
          "Wisconsin",
          "Oklahoma",
          "North Dakota",
          "Nevada",
          "Nebraska",
          "Arizona",
          "New Hampshire",
          "South Dakota",
          "Maine",
          "Iowa",
          "Washington",
          "Kansas",
          "Minnesota",
          "Michigan",
        ],
      };

      // Default view
      showField();

      // General Split UM
      if (!stateRules.excludedStates.includes(state) && umTypeVal === "Split") {
        showField();
      } else {
        hideField();
        makeOptional();
      }
      // General CSL BI
      if (stateRules.cslBIStates.includes(state) && umTypeVal === "CSL BI")
        showField();
      // General CSL
      if (stateRules.cslStates.includes(state) && umTypeVal === "CSL")
        showField();
      // Set field to optional for certain states
      if (stateRules.optionalStates.includes(state)) makeOptional();

      // Apply state-specific logic if available
      if (stateRules[state]) stateRules[state]();
    }

    // Debounce for change events
    const debouncedPropertyDamage = debounce(PropertyDamage, 100);

    // Initial run
    PropertyDamage();

    // Event binding for key fields
    $(
      '#question483032, input[name="UMPDRejectCA_YN"], #question483594, #question482293'
    ).on("change", debouncedPropertyDamage);
  });

  //Show Bodily Injury 0265-P Underinsured
  //Auto
  $(document).ready(function () {
    // Only operate on the designated quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    function BodilyInjuryUND() {
      var state = Instanda.Variables.PremiumState_CHOICE;
      const covTypeVal = $("#CovTypeValue").val();
      const umTypeVal = $("#UMTypeValue").val();
      var $question = $("#question483976");

      // Show/hide logic for SC, DC, ND & big group of states, including overlap for Split UM Type
      const umSplitStates = [
        "South Carolina",
        "District Of Columbia",
        "North Dakota",
        "Idaho",
        "Illinois",
        "Missouri",
        "Montana",
        "Indiana",
        "Pennsylvania",
        "Kentucky",
        "Wisconsin",
        "Hawaii",
        "Arizona",
        "Ohio",
        "Arkansas",
        "South Dakota",
        "Iowa",
        "Utah",
        "Minnesota",
        "Michigan",
        "West Virginia",
      ];
      if (umSplitStates.includes(state) && umTypeVal === "Split") {
        $question.show();
        if (state === "Hawaii") {
          $question.attr("required", true);
          $question.find("label").each(function () {
            if ($(this).find(".required-asterisk").length === 0) {
              $(this).append(
                '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
              );
            }
          });
        } else {
          $question.attr("required", false);
          $question.find("label .required-asterisk").remove();
        }
      } else if (state === "Washington" && covTypeVal === "Split") {
        $question.show();
      } else if (
        state === "Pennsylvania" &&
        (umTypeVal === "Split")
      ) {
        $question.show();
      } else {
        $question.hide();
      }

      // Mandatory logic for NJ, CT, IL, IN, MN, ND if Coverage Type is Split or Single
      const mandatoryStates = [
        "New Jersey",
        "Connecticut",
        "Illinois",
        "Indiana",
        "Minnesota",
        "North Dakota",
      ];
      if (mandatoryStates.includes(state)) {
        if (covTypeVal === "Split" || covTypeVal === "Single") {
          $question.attr("required", true);
          $question.find("label").each(function () {
            if ($(this).find(".required-asterisk").length === 0) {
              $(this).append(
                '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
              );
            }
          });
        } else {
          $question.attr("required", false);
          $question.find("label .required-asterisk").remove();
        }
      }
    }

    BodilyInjuryUND();

    // Bind to relevant change events
    $("#question483032, #question482293, #CovTypeValue").on(
      "change",
      function () {
        BodilyInjuryUND();
        if ($(this).is("#CovTypeValue")) {
          console.log(
            "change event triggered for Bodily Injury function called",
            $("#CovTypeValue").val()
          );
        }
      }
    );
  });

  // CSL option hide
  //Auto
  function CSLConstChoices() {
    // Only run if target page exists
    if (
      $(".page-quickquotequestions.page-number-6.package-24338").length === 0
    ) {
      console.log("Target page not found, exiting CSLConstChoices");
      return;
    }

    // Cache DOM elements and variables
    const $dropdown = $("#CSLLimit option");
    const state = Instanda?.Variables?.PremiumState_CHOICE || "";
    const cslExpDate = Instanda?.Variables?.CSLExpDate_TXT ?? false;

    // Error handling for missing critical elements
    if (!$dropdown.length) {
      console.error("CSLLimit dropdown options not found");
      return;
    }
    if (!state) {
      console.error("PremiumState_CHOICE is undefined");
      return;
    }

    // Log initial state
    console.log(
      `CSLConstChoices - State: ${state}, CSLExpDate_TXT: ${cslExpDate}`
    );

    // Utility function to handle option visibility
    const setOptionVisibility = ($option, value, show90k, show80k) => {
      if (value === "$90,000") {
        $option.toggle(show90k);
        console.log(`${show90k ? "Enabled" : "Disabled"} $90,000 option`);
      } else if (value === "$80,000") {
        $option.toggle(show80k);
        console.log(`${show80k ? "Enabled" : "Disabled"} $80,000 option`);
      }
    };

    // State-specific rules
    const stateRules = {
      Utah: () => {
        console.log("Applying Utah rules for CSLLimit");
        $dropdown.each(function () {
          const value = $(this).val();
          setOptionVisibility($(this), value, cslExpDate, !cslExpDate);
        });
      },
    };

    // Apply rules or do nothing for non-Utah states
    if (stateRules[state]) {
      stateRules[state]();
    }
  }

  // Initial call
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      CSLConstChoices();
    }
  });

  //Auto
  function UMCSLConstChoices() {
    // Only run if target page exists
    if (
      $(".page-quickquotequestions.page-number-6.package-24338").length === 0
    ) {
      console.log("Target page not found, exiting UMCSLConstChoices");
      return;
    }

    // Cache DOM elements and variables
    const $dropdown = $("#UMCSLLimitValue option");
    const state = Instanda?.Variables?.PremiumState_CHOICE || "";
    const cslExpDate = Instanda?.Variables?.CSLExpDate_TXT ?? false;

    // Error handling for missing critical elements
    if (!$dropdown.length) {
      console.error("UMCSLLimitValue dropdown options not found");
      return;
    }
    if (!state) {
      console.error("PremiumState_CHOICE is undefined");
      return;
    }

    // Log initial state
    console.log(
      `UMCSLConstChoices - State: ${state}, CSLExpDate_TXT: ${cslExpDate}`
    );

    // Utility function to handle option visibility
    const setOptionVisibility = ($option, value, show90k, show80k) => {
      if (value === "$90,000") {
        $option.toggle(show90k);
        console.log(`${show90k ? "Enabled" : "Disabled"} $90,000 option`);
      } else if (value === "$80,000") {
        $option.toggle(show80k);
        console.log(`${show80k ? "Enabled" : "Disabled"} $80,000 option`);
      } else {
        $option.show();
        console.log(`Enabled option: ${value}`);
      }
    };

    // State-specific rules
    const stateRules = {
      Utah: () => {
        console.log("Applying Utah rules for UMCSLLimitValue");
        $dropdown.each(function () {
          const value = $(this).val();
          setOptionVisibility($(this), value, cslExpDate, !cslExpDate);
        });
      },
      default: () => {
        console.log("Applying default rules for UMCSLLimitValue");
        $dropdown.each(function () {
          const value = $(this).val();
          setOptionVisibility($(this), value, false, true);
        });
      },
    };

    // Apply rules
    if (stateRules[state]) {
      stateRules[state]();
    } else {
      stateRules.default();
    }
  }
  // Initial call
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
      UMCSLConstChoices();
    }
  });

  //////////////////////////////////Default values and Display Conditions Covg Screen Auto Enhacements Start //////////////////////////////////
  //Auto
  function NJAddedPIPSelectEnhacement() {
    // Only execute logic if on the target quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    // Fields to control: Essential Services/Day, Income Continuation/Week, Death Benefit, Funeral Expenses, Broadened PIP
    const fields = [
      "#question488341",
      "#question488337",
      "#question488359",
      "#question488360",
      "#question488374",
    ];

    // Helper to show and make required, add red asterisk for select fields
    function showAndRequire() {
      fields.forEach(function (fld) {
        $(fld).show().attr("required", true);
      });
      $("#question488359 label").each(function () {
        if ($(this).find(".required-asterisk").length === 0) {
          $(this).append(
            '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
          );
        }
      });
      $("#question488360 label").each(function () {
        if ($(this).find(".required-asterisk").length === 0) {
          $(this).append(
            '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
          );
        }
      });
    }

    // Helper to hide and un-require all fields, remove asterisks
    function hideAndUnrequire() {
      fields.forEach(function (fld) {
        $(fld).hide().attr("required", false);
      });
      $("#question488359 label .required-asterisk").remove();
      $("#question488360 label .required-asterisk").remove();
    }

    if (state === "New Jersey") {
      const pipVal = $("#AddedPIP_CHOICE").val();
      if (
        pipVal === "Named Insured and Resident Relatives" ||
        pipVal === "Named Insured Only"
      ) {
        showAndRequire();
      } else {
        hideAndUnrequire();
      }
    } else {
      hideAndUnrequire();
    }
  }
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    NJAddedPIPSelectEnhacement();
  });
  //Auto
  $("#AddedPIP_CHOICE").on("change", function () {
    console.log("change event triggered for NJAddedPIPSelectEnhacement");
    NJAddedPIPSelectEnhacement();
  });
  //Auto
  $("#DelOtherMedBen_YNPYes").on("change", function () {
    $("#AddedPIP_CHOICE").val("");
    console.log("change event triggered for NJAddedPIPSelectEnhacement");
    NJAddedPIPSelectEnhacement();
  });
  //Auto
  function MIEnhaceRuleOnPIPSelect() {
    // Only execute logic if on the target quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;
    var $question = $("#question491995");
    // List of valid PIP limits (be sure amounts match dropdown options exactly)
    const PIPLim = ["$50,000", "$250,000", "$500,000"];

    // Always hide and make not required by default
    $question.hide().attr("required", false);
    // Remove required asterisks when hiding, if used
    $question.find("label .required-asterisk").remove();

    if (state === "Michigan") {
      console.log(
        "Inside MIEnhaceRuleOnPIPSelect function (Michigan logic applied)"
      );

      if (PIPLim.includes($("#PIPLim_CHOICE").val())) {
        $question.show().attr("required", true);
        // Add required asterisk if missing
        $question.find("label").each(function () {
          if ($(this).find(".required-asterisk").length === 0) {
            $(this).append(
              '<span class="required-asterisk" style="color: red; font-size: 16px;">*</span>'
            );
          }
        });
        console.log("Showing and requiring Excess Attendant Care question");
      } else {
        $question.hide().attr("required", false);
        $question.find("label .required-asterisk").remove();
        console.log("Hiding Excess Attendant Care question");
      }
    }
  }
  // Event binding for PIPLim_CHOICE changes
  //Auto
  $("#PIPLim_CHOICE").on("change", function () {
    console.log(
      "change event triggered for MIEnhaceRuleOnPIPSelect",
      $("#PIPLim_CHOICE").val()
    );
    MIEnhaceRuleOnPIPSelect();
  });
  // Initial page load logic
  //Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    MIEnhaceRuleOnPIPSelect();
  });

  //Auto
  function KYCTAddedPIPSelectEnhacement() {
    // Ensure logic only runs on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    // Kentucky logic
    if (state === "Kentucky") {
      var addPipVal = $("#AddPIPKY_NUM").val();
      var basicPipVal = $("#BasicPIPKY_CHOICEP").val();

      // Hide and un-require everything if selection is None, empty, Guest, or empty
      if (
        addPipVal === "None" ||
        addPipVal === "" ||
        basicPipVal === "Guest" ||
        basicPipVal === ""
      ) {
        $("#question482688").hide().attr("required", false);
        $("#question488375").hide().attr("required", false);
        $("#question488377").hide().attr("required", false);
        $("#question488379").hide().attr("required", false);
      } else {
        // Show and require all relevant questions
        $("#question482688").show().attr("required", true);
        $("#question488375").show().attr("required", true);
        $("#question488377").show().attr("required", true);
        $("#question488379").show().attr("required", true);

        // Value assignment mapping by AddPIPKY_NUM selection
        var valueMap = {
          "$10,000": 50,
          "$20,000": 100,
          "$30,000": 200,
          "$40,000": 300,
          "$65,000": 400,
          "$90,000": 550,
        };
        var numVal = valueMap[addPipVal];
        if (numVal !== undefined) {
          $("#AddedPIPReplSerWeekCTKY_NUM").val(numVal);
          $("#AddedPIPSurvBenWeek_NUM").val(numVal);
          $("#AddedPIPWorkLossWeek_NUM").val(numVal);
          $("#AddedPIPServicesLoss_NUM").val(numVal);
        }
      }
    }
    // Connecticut logic
    else if (state === "Connecticut") {
      // Use .instanda-selected input for Yes/No
      var ctSelected = $("#question482631 .instanda-selected input").val();
      if (ctSelected === "Yes") {
        $("#question482688").show();
        $("#AddedPIPWorkLossPerWeek_CHOICEP").attr("required", true);
        $("#AddedPIPReplSerWeekCTKY_NUM").val(200);

        $("#question488375").show();
        $("#AddedPIPSurvBenWeek_NUM").attr("required", true);

        $("#question488377").show();
        $("#AddedPIPWorkLossWeek_NUM").attr("required", true);

        $("#question488379").show();
        $("#AddedPIPServicesLoss_NUM").attr("required", true);
      } else {
        $("#question482688").hide();
        $("#AddedPIPWorkLossPerWeek_CHOICEP").attr("required", false);

        $("#question488375").hide();
        $("#AddedPIPSurvBenWeek_NUM").attr("required", false);

        $("#question488377").hide();
        $("#AddedPIPWorkLossWeek_NUM").attr("required", false);

        $("#question488379").hide();
        $("#AddedPIPServicesLoss_NUM").attr("required", false);
      }
    }
  }

  // Event bindings for UI changes that affect logic
  //Auto
  $("#question482718").on("change", function () {
    console.log("change event triggered for KYCTAddedPIPSelectEnhacement");
    KYCTAddedPIPSelectEnhacement();
  });
  //Auto
  $("#question482631").on("change", function () {
    console.log("change event triggered for KYCTAddedPIPSelectEnhacement");
    KYCTAddedPIPSelectEnhacement();
  });
  //Auto
  $("#question482574").on("change", function () {
    console.log(
      "change event triggered for KYCTAddedPIPSelectEnhacement - MULTI-ITEMS"
    );
    KYCTAddedPIPSelectEnhacement();
  });

  function RejectWorkLoss() {
    // Only execute logic if on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    if (state === "Michigan") {
      const excessChoice = $("#ExcessPIP_CHOICE").val();
      // If the selection is "Work Loss Only" or "Both", enforce 'No' for "Reject Work Loss"
      if (excessChoice === "Work Loss Only" || excessChoice === "Both") {
        console.log(
          "inside Michigan logic: setting RejectWorkLoss to 'No' and making readonly"
        );

        $("#question488385").addClass("readonly");

        // Get radio labels for Yes/No
        var yesLabel = $("label:has(#RejectWorkLoss_YNYes)");
        var noLabel = $("label:has(#RejectWorkLoss_YNNo)");

        // Set selection to 'No'
        noLabel.trigger("click");
        yesLabel
          .removeClass("instanda-selected")
          .addClass("instanda-unselected");
        noLabel
          .addClass("instanda-selected")
          .removeClass("instanda-unselected");
      } else {
        // Otherwise, remove the read-only state and allow selection
        console.log(
          "Michigan state, but ExcessPIP_CHOICE not Work Loss Only/Both, removing readonly"
        );
        $("#question488385").removeClass("readonly");
      }
    }
  }

  //////////////////////////////////Default values and Display Conditions Covg Screen Auto Enhacements End //////////////////////////////////

  /////////////// hiding the UM ONLY option for Uninsured/Underinsured type start  //////////////////
  //Auto
  function NCUMTypeVisibility() {
    // Only execute logic if on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    // Check for North Carolina and the effective date
    if (state === "North Carolina") {
      // Target cut-off date for option visibility
      var cutoff = new Date("2025-06-30");
      var now = new Date();

      // Show or hide 'UM ONLY' option based on cutoff date
      if (now < cutoff) {
        $('#UMUIMTypeValue option[value="UM ONLY"]').show();
      } else {
        $('#UMUIMTypeValue option[value="UM ONLY"]').hide();
      }
    }
  }

  //// Function to hide options based on state start ////
  //Auto
  function hideAddedPIPAggrLimVal() {
    // Only execute logic if on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    const dropdown = document.getElementById("AddedPIPAggLim_CHOICE");
    var state = Instanda.Variables.PremiumState_CHOICE; // State from Instanda variable

    const CTVal = ["10000", "15000", "25000", "50000", "75000", "100000"];
    const NDVal = ["40000", "80000", "100000", "110000"];

    if (dropdown) {
      const options = dropdown.getElementsByTagName("option");

      if (state === "Connecticut") {
        console.log(
          "Connecticut: Showing only CT allowed options: " + CTVal.join(", ")
        );
        for (let i = 0; i < options.length; i++) {
          options[i].hidden = !CTVal.includes(options[i].value);
          if (options[i].hidden) {
            console.log(
              "Connecticut: Hiding option with value " + options[i].value
            );
          }
        }
      } else if (state === "North Dakota") {
        console.log(
          "North Dakota: Showing only ND allowed options: " + NDVal.join(", ")
        );
        for (let i = 0; i < options.length; i++) {
          options[i].hidden = !NDVal.includes(options[i].value);
          if (options[i].hidden) {
            console.log(
              "North Dakota: Hiding option with value " + options[i].value
            );
          }
        }
      }
    } else {
      console.log("Dropdown element with ID AddedPIPAggLim_CHOICE not found.");
    }
  }

  // Call the function
  $("#question482631").on("change", function () {
    console.log("hideAddedPIPAggrLimVal function called");
    hideAddedPIPAggrLimVal();
  });
  // Function to hide options based on state end ////
  // hideTotal Benefit Limit function starts here //
  //Auto
  function hideTotalBenefitLimit() {
    // Only execute logic if on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    // Always hide by default
    $("#question482552").hide();

    if (state === "Pennsylvania") {
      // Show only if the controlling answer is "Yes"
      var answer = $("#question482551 .instanda-selected input").val();
      if (answer === "Yes") {
        $("#question482552").show();
        console.log("Total Benefit Limit Shown");
      } else {
        $("#question482552").hide();
        console.log("Total Benefit Limit Hidden");
      }
    }
  }

  // Bind the update to changes in the controlling question
  //Auto
  $("#question482551").on("change", function () {
    console.log(
      "hideTotalBenefitLimit function called",
      $("#question482551 .instanda-selected input").val()
    );
    hideTotalBenefitLimit();
  });

  // hide TotalBenefit Limit function ends here //
  //Auto
  function hideCSLDeductibleGA() {
    // Only execute logic if on the correct quick quote page
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;

    var state = Instanda.Variables.PremiumState_CHOICE;

    if (state === "Georgia") {
      console.log("show/hide csl deductible for Georgia");

      if ($("#UMTypeValue").val() === "CSL") {
        console.log("showing csl deductible for Georgia for UMType CSL");
        $("#question483034").show();
      } else {
        console.log("hiding csl deductible for Georgia for UMType not CSL");
        $("#question483034").hide();
      }
    } else {
      // Optionally ensure the deductible is hidden in all other states
      $("#question483034").hide();
      console.log("State is not Georgia; hiding csl deductible.");
    }
  }

  // Bind on UMTypeValue changes
  //Auto
  $("#UMTypeValue").on("change", function () {
    console.log(
      "change event triggered for hideCSLDeductibleGA",
      $("#UMTypeValue").val()
    );
    hideCSLDeductibleGA();
    hideUMOnlyOptionForExpiredDate();
    defaultBodInjAndPropDamForNC();
  });

  //Auto
  $(document).ready(function () {
    // Start : Drivername for EL on Add infraction Button
    if (
      document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24428"
      )
    ) {
      document
        .getElementById("Infractions_MIaddButton")
        .addEventListener("click", function () {
          setTimeout(setupDropdownsForAssignments, 100);
        });
    }
    // End : Drivername for EL on Add infraction Button
    if ($(".page-quickquotequestions.page-number-6.package-24338").length === 0)
      return;
    // Execute all initialization and UI control functions:
    defaultBodInjAndPropDamForNC();
    MedicalExpenses();
    console.log("Document is ready calling MedicalExpenses");
    KTBasicPipIsBasic();
    console.log("Document is ready calling KTBasicPipIsBasic");
    setTimeout(function () {
      CTDEBasicPipIsYes();
      console.log(
        "Document is ready, calling CTDEBasicPipIsYes with value:",
        $("#question482487 .instanda-selected input").val()
      );
    }, 100);
    DECovTypeSplitOrSingle();
    console.log("Document is ready,DECovTypeSplitOrSingle is called ");
    HICovTypeSplitOrSingle();
    console.log("Document is ready,HICovTypeSplitOrSingle is called ");
    HideAddedPIPCTND();
    console.log("Document is ready calling HideAddedPIPCTND");
    DFValBasicPipIsYes();
    console.log("Document is ready,DFValBasicPipIsYes is called ");
    NJPolicyTypeIsBasic();
    console.log("Document is ready,NJPolicyTypeIsBasic is called ");
    NDCTAddedPipIsYes();
    console.log("Document is ready,NDCTAddedPipIsYes is called ");
    KYAddedPipIsBasic();
    console.log("Document is ready,KYAddedPipIsBasic is called ");
    UnInsMotLimitLabelMulStates();
    console.log("Document is ready, UnInsMotLimitLabelMulStates is called");
    UnUdMorLimitLabelMulStates();
    console.log("Document is ready,UnUdMorLimitLabelMulStates is called ");
    NYStatSuppCovType();
    console.log("Document is ready,NYStatSuppCovType is called ");
    showDefaultFuneralExp();
    console.log("Document is ready,showDefaultFuneralExp is called ");
    hideRehabilitationExpenses();
    console.log("Document is ready,hideRehabilitationExpenses is called ");
    //showCSL(); Commeting as this func is not in the scope BH-26085
    //console.log("Document is ready,showCSL is called ");
    // showPropDamageCov(); Commeting as this func is not in the scope BH-26085
    // console.log("Document is ready, calling showPropDamageCov");
    setDefBodilyInj();
    console.log("Document is ready, calling setDefBodilyInj");
    // Reset AddedPIP_CHOICE value
    $("#AddedPIP_CHOICE").val("");
    NJAddedPIPSelectEnhacement();
    console.log("Document is ready calling NJAddedPIPSelectEnhacement");
    MIEnhaceRuleOnPIPSelect();
    console.log("Document is ready calling MIEnhaceRuleOnPIPSelect");
    // KY/CT conditional pip logic
    KYCTAddedPIPSelectEnhacement();
    console.log("Document is ready calling KYCTAddedPIPSelectEnhacement");
    // Michigan logic for RejectWorkLoss
    RejectWorkLoss();
    // React to PIP type changes that might impact this logic as well
    $("#question488384").on("change", function () {
      console.log(
        "change event triggered for MIEnhaceRuleOnPIPSelect",
        $("#ExcessPIP_CHOICE").val()
      );
      RejectWorkLoss();
    });
    NCUMTypeVisibility();
    console.log("Document is ready calling NCUMTypeVisibility");
    hideAddedPIPAggrLimVal();
    hideTotalBenefitLimit();
    hideCSLDeductibleGA();
  });

  /////////////// hiding the UM ONLY option for Uninsured/Underinsured type end  //////////////////

  //Auto
  // Function to calculate the difference in months between two dates, considering days for accuracy
  function dateDifferenceInMonths(date1, date2) {
    let d1 = parseDate(date1);
    let d2 = parseDate(date2);

    let years = d2.getFullYear() - d1.getFullYear();
    let months = d2.getMonth() - d1.getMonth();
    let days = d2.getDate() - d1.getDate();

    // Adjust months if days are negative
    if (days < 0) {
      months -= 1;
      // Calculate the number of days in the previous month
      let previousMonth = new Date(d2.getFullYear(), d2.getMonth(), 0);
      days += previousMonth.getDate();
    }
    return years * 12 + months + days / 30; // Approximate the fraction of the month
  }
  //Auto
  function handleOccDrivers() {
    console.log("Handling Occupation drivers");
    $(".occDriversYnp").each(function () {
      const parent = $(this).parent();
      if (
        $(this).find(".instanda-question-yes-no-parent-yes.instanda-selected")
        .length == 0
      )
        $(this).appendTo(parent);
    });

    $(".occDriversYnp .instanda-question-yes-no-parent-no input").on(
      "change",
      function () {
        const container = $(this).closest(".occDriversYnp");
        const parent = container.parent();
        container.appendTo(parent);
      }
    );
  }

  // Call the autoMultiItems function to initialize the logic
  //Auto
  $(document).ready(function () {
    if (isReadOnlyView()) {
      return;
    }
    // Add check for quick quote page 2, package 24338
    if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
      console.log("Onload function call autoMultiItems");
      autoMultiItems();
    }
  });

  const miAddButton = $('[id*="_MIaddButton"]');

  $(function () {
    $(document).on("click", '[id*="_MIaddButton"]', function () {
      if (isReadOnlyView()) return;

      console.log("Calling autoMultiItems for new MI");

      setTimeout(() => {
        console.log("entered time out");

        // Helper to run functions for the last container of a given selector/prefix
        function runForLastContainer(selector, prefix, callbacks = []) {
          console.log("entered runForLastContainer");
          const $containers = $(selector);
          console.log("defined containers", $containers);

          const $newContainer = $containers.last();
          console.log("defined new containers", $newContainer);

          const miNumber = extractMINumber($newContainer[0], prefix);
          console.log(
            "Auto Multi items functions called for MI number: ",
            miNumber
          );

          //Filling hidden transaction type field when vehicle is added
          if (Instanda.Variables.CreatedFrom == "MTA")
            $(`#Vehicle_MI${miNumber}_TransactType_TXT`)
            .val(`MTA${Instanda.Variables.MTA_COUNT}`)
            .trigger("input");
          else if (Instanda.Variables.CreatedFrom == "Renewal")
            $(`#Vehicle_MI${miNumber}_TransactType_TXT`)
            .val(`RENEW${Instanda.Variables.RENEWAL_COUNT}`)
            .trigger("input");

          //Filling hidden transaction type field when vehicle ends here

          $(`#Vehicle_MI${miNumber}_NewlyAdded_TXT`).val("Yes");

          if ($(`#Vehicle_MI${miNumber}_Vehicle_CustomIndex`).length) {
            $(`#Vehicle_MI${miNumber}_Vehicle_CustomIndex`).val(miNumber);
          }
          if ($(`#Driver_MI${miNumber}_Driver_CustomIndex`).length) {
            $(`#Driver_MI${miNumber}_Driver_CustomIndex`).val(miNumber);
          }
          if ($(`#Infraction_MI${miNumber}_Infraction_CustomIndex`).length) {
            $(`#Infraction_MI${miNumber}_Infraction_CustomIndex`).val(miNumber);
          }
          if ($(`#Claim_MI${miNumber}_Claim_CustomIndex`).length) {
            $(`#Claim_MI${miNumber}_Claim_CustomIndex`).val(miNumber);
          }
          if ($(`#Vehicle_MI${miNumber}_VehiclePrem_CustomIndex`).length) {
            $(`#Vehicle_MI${miNumber}_VehiclePrem_CustomIndex`).val(miNumber);
          }

          console.log("Newly Added set to Yes");
          callbacks.forEach((fn) =>
            safeRun(() => fn($newContainer[0], miNumber))
          );
        }

        // Driver MI on page 2

        // Vehicle MI on page 3
        if (
          $(".page-quickquotequestions.page-number-4.package-24338").length > 0
        ) {
          runForLastContainer(
            '[class*="instanda-multi-item-Vehicle_MI"]',
            "instanda-multi-item-Vehicle_MI",
            [handleOccDrivers, setupDropdownsForAssignments]
          );
        }

        // Updated the logic for New Vehiclescreen
        if (
          $(".page-quickquotequestions.page-number-5.package-24338").length > 0
        ) {
          runForLastContainer(
            '[class*="instanda-multi-item-"]',
            "instanda-multi-item-",
            [setupDropdownsForVehicleAssignments, setupDropdownsForAssignments]
          );
        }

        // Generic MI container logic (always runs)
        const entityPrefix = $(this)
          .attr("id")
          .replace(/addButton$/, "");
        const selector = `[class*="instanda-multi-item-${entityPrefix}"]`;
        runForLastContainer(selector, "instanda-multi-item-", [autoMultiItems]);

        // Additional logic for package-24428
        if ($(".package-24428").length > 0) {
          runForLastContainer(
            '.instanda-multi-item[class*="instanda-multi-item-"]',
            "instanda-multi-item-",
            [ExLiabMultiItems, setupDropdownsForAssignments]
          );
        }
      }, 2); // Short delay to ensure DOM is updated
    });
  });

  //auto page 2 drivers for calling remove on listener function to remove drivers from hidden store list of drivers for prefill start
  function callRemoveDriverListener() {
    //calling the function when driver is removed
    document
      .querySelectorAll(".instanda-multi-item-remove")
      .forEach((button) => {
        button.addEventListener("click", () => {
          setTimeout(() => {
            prefillDriversListForDropdown();
            console.log(
              "the remove button is clicked and prefillDriversListForDropdown function called"
            );
          }, 0);
        });
      });
  }
  //auto page 2 drivers for calling remove on listener function to remove drivers from hidden store list of drivers for prefill end

  //auto page 3 vehicles removing the readonly property if field has no value when adding new vehicle start
  function removeReadOnlyForCNOAVal() {
    const selectors = [
      '[id^="Vehicle_MI"][id$="_CostNew_NUM"],[id^="Vehicle_MI"][id$="_OriginalAgreedVal_NUM"],[id^="Vehicle_MI"][id$="_PurchaseDate_DATE"]',
    ].join(",");

    if (
      $(
        ".page-quickquotequestions.created-from-renewal.page-number-4.package-24338"
      ).length > 0 ||
      $(
        ".page-quickquotequestions.created-from-mta.page-number-4.package-24338"
      ).length > 0
    ) {
      document.querySelectorAll(selectors).forEach((input) => {
        const isEmpty = input.value === "";
        Object.assign(input.style, {
          pointerEvents: isEmpty ? "auto" : "none",
          cursor: isEmpty ? "text" : "not-allowed",
          backgroundColor: isEmpty ? "#fff" : "#eee",
          opacity: isEmpty ? "1" : undefined,
        });
      });
    }
  }

  //auto page 3 vehicles removing the readonly property if field has no value when adding new vehicle end

  //auto page 2 subjectivities hiding the whole screen for rewrite endorsement start
  function HideSubjectivitiesForMTARewrite() {
    if (
      $(".page-postquotequestions.created-from-mta.page-number-2.package-24338")
      .length > 0
    ) {
      var changeReason = Instanda.Variables.ChangeReason_Choice;
      if (changeReason === "Reissue") {
        document.querySelector(".instanda-post-quote-questions").style.display =
          "none";
      }
    }
  }
  $(document).ready(function () {
    safeRun(() => HideSubjectivitiesForMTARewrite());
  });

  //auto page 2 subjectivities hiding the whole screen for rewrite endorsement end

  // Function - AutomultiItems
  function autoMultiItems() {
    let miContainers;
    let prefix;
    let functionList = [];

    // Determine MI type and set function list
    if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
      console.log("Entered auto multi items for page 2 ");
      miContainers = document.querySelectorAll(
        '[class*="instanda-multi-item-Driver_MI"]'
      );
      prefix = "instanda-multi-item-Driver_MI";
      functionList = [
        suspRevokDateEmptyMsg,
        ageinput,
        hideNonBinaryOptions,
        hideDriverDropdownOptions,
        hideMariStsDropdownOptions,
        setDefaultOptionForRelInsFirstItem,
        setDefaultOptionDriverType,
        handleInfractions,
        driverAge,
        licenseStateDef,
        setdriverTypeAgeRenew,
        initDropdownLogic,
        UnveriSurc,
        faultIndicatorLogic,
        showTNMotorTrainDiscWarn,
        showAdvCourse,
        showTXAlcDrugDiscWarn,
        showCourseDiscWarnMonthBased,
        showMOMVCourseWarnMonthBased,
        showDDCourseWarnMonthBased,
        showMDCourseWarnMonthBased,
        showMECourseWarnMonthBased,
        showMCAPCourseWarnMonthBased,
        showSOMCourseWarnMonthBased,
        showMVDCourseWarnMonthBased,
        showMVAPCourseWarnMonthBased,
        setMaritalStatus,
        hideDispHead,
        callRemoveDriverListener,
      ];
    } else if (
      $(".page-quickquotequestions.page-number-4.package-24338").length > 0
    ) {
      miContainers = document.querySelectorAll(
        '[class*="instanda-multi-item-Vehicle_MI"]'
      );
      prefix = "instanda-multi-item-Vehicle_MI";
      functionList = [
        //  VehOwnedLeasedDefMI,
        //  VehOwnedLeasedDefCM,
        //  EffectiveDef,
        //  CollectorVehMake,
        //  HideMilesDriven,
        //  HideDaysWeek,
        //  HideSnowmobile,
        //  GaragedAtSecMI,
        //  MultiCarCredit,
        //  HideStoredmasonryMI,
        //  showExtended,
        //  ReportedFirstPoten,
        //  RegisState,
        //  miVehicleType,
        //  miCollectorTypeRenewal,
        //  modelYear,
        //  ModelAndBodyStyle,
        //  MaxOperateSpeed,
        //  OutsideAgreedValDisplay,
        removeReadOnlyForCNOAVal,
        //  miReadonly,
        //  displayMarketValOverride,
        //  VehHeightBroker,
      ];
    } else {
      miContainers = document.querySelectorAll(
        '.instanda-multi-item[class*="instanda-multi-item-"]'
      );
      prefix = "instanda-multi-item-";
      // Add any generic functions if needed
      functionList = [];
    }

    if (miContainers && prefix) {
      miContainers.forEach((container) => {
        const miNumber = extractMINumber(container, prefix);

        // Run all relevant functions safely
        functionList.forEach((fn) => safeRun(() => fn(container, miNumber)));

        // Date picker logic (unchanged, but you can also wrap in safeRun if needed)
        const questionIds = [
          "question487623",
          "question486321",
          "question481112",
          "question486329",
          "question487636",
          "question486332",
          "question486138",
          "question487605",
          "question487626",
          "question486326",
          "question487594",
          "question487587",
        ]; // Add more as needed

        let datePickerVisible = {};

        setInterval(() => {
          questionIds.forEach((id) => {
            const isPickerVisible =
              $(`#${id} .bootstrap-datetimepicker-widget:visible`).length > 0;

            if (!datePickerVisible[id] && isPickerVisible) {
              datePickerVisible[id] = true;
            } else if (datePickerVisible[id] && !isPickerVisible) {
              datePickerVisible[id] = false;

              // Wrap these in safeRun for robustness
              safeRun(() => showTNMotorTrainDiscWarn(container, miNumber));
              safeRun(() => showAdvCourse(container, miNumber));
              safeRun(() => showTXAlcDrugDiscWarn(container, miNumber));
              safeRun(() => showCourseDiscWarnMonthBased(container, miNumber));
              safeRun(() => showMOMVCourseWarnMonthBased(container, miNumber));
              safeRun(() => showDDCourseWarnMonthBased(container, miNumber));
              safeRun(() => showMDCourseWarnMonthBased(container, miNumber));
              safeRun(() => showMECourseWarnMonthBased(container, miNumber));
              safeRun(() => showMCAPCourseWarnMonthBased(container, miNumber));
              safeRun(() => showSOMCourseWarnMonthBased(container, miNumber));
              safeRun(() => showMVDCourseWarnMonthBased(container, miNumber));
              safeRun(() => showMVAPCourseWarnMonthBased(container, miNumber));
            }
          });
        }, 100);
      });
    }
  }

  // generic Function for course date validation
  function genericCourseDateValidation(
    container,
    miNumber,
    courseDateSelector,
    warningSelectors
  ) {
    const courseDateInput = container.querySelector(courseDateSelector);
    const validmonths36 = container.querySelector(
      warningSelectors.thirtySixMonDteVal
    );
    const validmonths24 = container.querySelector(
      warningSelectors.twentyFourMonDteVal
    );
    const validmonths60 = container.querySelector(
      warningSelectors.sixtyMonDteVal
    );
    const noValidation = container.querySelector(warningSelectors.noValidation);

    if (courseDateInput && validmonths36 && validmonths24 && validmonths60) {
      function CourseDiscDateLogic() {
        const courseDateObj = new Date(courseDateInput.value);
        const policyEffDateObj = new Date(
          Instanda.Variables.FormatEffDate_Date
        );
        let monthsDifference = 60; // Default to 60 months
        let warningElement;

        // Determine the months difference and warning element based on the state
        if (Instanda.Variables.ThirtySixMonVal_State) {
          monthsDifference = 36;
          warningElement = validmonths36;
        } else if (
          Instanda.Variables.PremiumState_CHOICE === "Wyoming" ||
          Instanda.Variables.PremiumState_CHOICE === "Washington"
        ) {
          monthsDifference = 24;
          warningElement = validmonths24;
        } else {
          monthsDifference = 60;
          warningElement = validmonths60;
        }

        // Calculate the date before the policy effective date based on the months difference
        const dateBeforePolicyEffDate = new Date(policyEffDateObj);
        dateBeforePolicyEffDate.setMonth(
          dateBeforePolicyEffDate.getMonth() - monthsDifference
        );

        // Hide all warning elements
        $(validmonths36).hide();
        $(validmonths24).hide();
        $(validmonths60).hide();
        $(noValidation).hide();

        if (courseDateObj <= dateBeforePolicyEffDate) {
          $(warningElement).show(); // Show the appropriate warning element
          $(noValidation).show();
        }
      }

      CourseDiscDateLogic();

      $(courseDateSelector).on("input", function () {
        CourseDiscDateLogic();
      });

      setInterval(function () {
        const isPickerVisible =
          $(".bootstrap-datetimepicker-widget:visible").length > 0;
        if (!datePickerVisible && isPickerVisible) {
          datePickerVisible = true;
        } else if (datePickerVisible && !isPickerVisible) {
          datePickerVisible = false;
          CourseDiscDateLogic();
        }
      }, 100);
    } else {
      $(validmonths36).hide();
      $(validmonths24).hide();
      $(validmonths60).hide();
      $(noValidation).hide();
    }
  }

  // Function to implement course date validation for 'Accident Prevention'
  function showCourseDiscWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_AP_CourseDate_DATE`, {
        thirtySixMonDteVal: ".ApcCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".ApcCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".ApcCourse .sixtyMonDteVal",
        noValidation: ".ApcCourse",
      }
    );
  }

  // Function to implement course date validation for 'Mature Operator'
  function showMOMVCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_MOMV_CourseDate_DATE`, {
        thirtySixMonDteVal: ".MOMVACourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MOMVACourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MOMVACourse .sixtyMonDteVal",
        noValidation: ".MOMVACourse",
      }
    );
  }

  // Function to implement course date validation for 'Defensive Driver'
  function showDDCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_DD_CourseDate_DATE`, {
        thirtySixMonDteVal: ".DefDriCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".DefDriCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".DefDriCourse .sixtyMonDteVal",
        noValidation: ".DefDriCourse",
      }
    );
  }

  // Function to implement course date validation for 'Mature Driver'
  function showMDCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_MD_CourseDate_DATE`, {
        thirtySixMonDteVal: ".MDDCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MDDCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MDDCourse .sixtyMonDteVal",
        noValidation: ".MDDCourse",
      }
    );
  }

  // Function to implement course date validation for 'Motorcycle Education'
  function showMECourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_ME_CourseDate_DATE`, {
        thirtySixMonDteVal: ".MECourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MECourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MECourse .sixtyMonDteVal",
        noValidation: ".MECourse",
      }
    );
  }

  // Function to implement course date validation for 'Motorcycle Accident Prevention'
  function showMCAPCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_MCAP_CourseDate_DATE`, {
        thirtySixMonDteVal: ".MAPCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MAPCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MAPCourse .sixtyMonDteVal",
        noValidation: ".MAPCourse",
      }
    );
  }

  // Function to implement course date validation for 'Sr. Operator Motor'
  function showSOMCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_SOMVAP_CourseDate_DATE`, {
        thirtySixMonDteVal: ".SrOpCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".SrOpCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".SrOpCourse .sixtyMonDteVal",
        noValidation: ".SrOpCourse",
      }
    );
  }

  // Function to implement course date validation for 'Motor Vehicle Driver Improvement'
  function showMVDCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_MVDI_CourseDate_DATE`, {
        thirtySixMonDteVal: ".MVDCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MVDCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MVDCourse .sixtyMonDteVal",
        noValidation: ".MVDCourse",
      }
    );
  }

  // Function to implement course date validation for 'Motor Vehicle Accident Prevention'
  function showMVAPCourseWarnMonthBased(container, miNumber) {
    genericCourseDateValidation(
      container,
      miNumber,
      `#Driver_MI${miNumber}_MVAP_CourseDisc_DATE`, {
        thirtySixMonDteVal: ".MVAPCourse .thirtySixMonDteVal",
        twentyFourMonDteVal: ".MVAPCourse .twentyFourMonDteVal",
        sixtyMonDteVal: ".MVAPCourse .sixtyMonDteVal",
        noValidation: ".MVAPCourse",
      }
    );
  }

  // Specific function 1 for validating course date for "Motor Cycle rider"
  function showTNMotorTrainDiscWarn(container, miNumber) {
    const motorDiscTrainDate = container.querySelector(
      `#Driver_MI${miNumber}_MCRideTrainCourseDiscDate_DATE`
    );
    const tnMotorTrainDisc = container.querySelector(".TNMotorTrainDisc");

    if (motorDiscTrainDate && tnMotorTrainDisc) {
      function motorDiscTrainDateLogic() {
        if (Instanda.Variables.PremiumState_CHOICE === "Tennessee") {
          const courseDateObj = motorDiscTrainDate.value;
          if (
            dateDifferenceInMonths(
              courseDateObj,
              Instanda.Variables.FormatEffDate_Date
            ) >= 36
          ) {
            $(tnMotorTrainDisc).show();
          } else {
            $(tnMotorTrainDisc).hide();
          }
        }
      }

      motorDiscTrainDateLogic();
      $(`#Driver_MI${miNumber}_MCRideTrainCourseDiscDate_DATE`).on(
        "input",
        function () {
          motorDiscTrainDateLogic();
        }
      );
      setInterval(function () {
        const isPickerVisible =
          $("#question487623 .bootstrap-datetimepicker-widget:visible").length >
          0;

        if (!datePickerVisible && isPickerVisible) {
          datePickerVisible = true;
        } else if (datePickerVisible && !isPickerVisible) {
          datePickerVisible = false;
          motorDiscTrainDateLogic();
        }
      }, 100);
    } else {
      $(tnMotorTrainDisc).hide();
    }
  }

  // Specific function 2 for validating course date for "Alcohol and Drug Awareness"
  function showTXAlcDrugDiscWarn(container, miNumber) {
    const adaCourseDate = container.querySelector(
      `#Driver_MI${miNumber}_ADA_CourseDate_DATE`
    );
    const txAlcDrugDisc = container.querySelector(".TXAlcDrugDisc");

    if (adaCourseDate && txAlcDrugDisc) {
      function adaCourseDateLogic() {
        if (Instanda.Variables.PremiumState_CHOICE === "Texas") {
          const courseDateObj = adaCourseDate.value;
          if (
            dateDifferenceInMonths(
              courseDateObj,
              Instanda.Variables.FormatEffDate_Date
            ) >= 36
          ) {
            $(txAlcDrugDisc).show();
          } else {
            $(txAlcDrugDisc).hide();
          }
        }
      }
      adaCourseDateLogic();
      $(`#Driver_MI${miNumber}_ADA_CourseDate_DATE`).on("input", function () {
        adaCourseDateLogic();
      });
      setInterval(function () {
        const isPickerVisible =
          $("#question486321 .bootstrap-datetimepicker-widget:visible").length >
          0;

        if (!datePickerVisible && isPickerVisible) {
          datePickerVisible = true;
        } else if (datePickerVisible && !isPickerVisible) {
          datePickerVisible = false;
          adaCourseDateLogic();
        }
      }, 100);
    } else {
      $(txAlcDrugDisc).hide();
    }
  }

  // Specific function 3 for validating course date for "Advanced Course"
  function showAdvCourse(container, miNumber) {
    const adaCourseDate = container.querySelector(
      `#Driver_MI${miNumber}_AC_CourseDate_DATE`
    );
    const advCourseDate = container.querySelector(".DDDAdvCourse");

    if (adaCourseDate && advCourseDate) {
      function adaCourseDateLogic() {
        if (Instanda.Variables.PremiumState_CHOICE === "Delaware") {
          const courseDateObj = adaCourseDate.value;
          console.log(
            dateDifferenceInMonths(
              courseDateObj,
              Instanda.Variables.FormatEffDate_Date
            )
          );
          if (
            dateDifferenceInMonths(
              courseDateObj,
              Instanda.Variables.FormatEffDate_Date
            ) >= 36
          ) {
            $(advCourseDate).show();
          } else {
            $(advCourseDate).hide();
          }
        }
      }
      adaCourseDateLogic();
      $(`#Driver_MI${miNumber}_AC_CourseDate_DATE`).on("input", function () {
        adaCourseDateLogic();
      });
      setInterval(function () {
        const isPickerVisible =
          $("#question487600 .bootstrap-datetimepicker-widget:visible").length >
          0;

        if (!datePickerVisible && isPickerVisible) {
          datePickerVisible = true;
        } else if (datePickerVisible && !isPickerVisible) {
          datePickerVisible = false;
          adaCourseDateLogic();
        }
      }, 100);
    } else {
      $(advCourseDate).hide();
    }
  }

  // Function to prefill the Licensing State to Premium State - Auto
  function licenseStateDef(container, miNumber) {
    if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
      const premState = Instanda.Variables.PremiumState_CHOICE;
      const driverLicState = $(`#Driver_MI${miNumber}_LicenseState_CHOICE`);
      console.log(
        "Licensing state: ",
        $(`#Driver_MI${miNumber}_LicenseState_CHOICE`).val(),
        miNumber
      );
      // Only set if field exists and is empty
      if ($(`#Driver_MI${miNumber}_LicenseState_CHOICE`).val() === "") {
        driverLicState.val(premState);
      }
    }
  }

  // Function to set Driver Type = "Licensed" during renewal if Driver Type is "Permit" and age >= 19.
  function setdriverTypeAgeRenew(container, miNumber) {
    const driverAge = container.querySelector(
      `#Driver_MI${miNumber}_D_Age_NUM`
    );
    const driverType = container.querySelector(
      `#Driver_MI${miNumber}_DriverType_CHOICEP`
    );

    if (Instanda.Variables.CreatedFrom === "Renewal") {
      if (
        driverType &&
        driverType.value === "Permit" &&
        driverAge &&
        driverAge.value >= 19
      ) {
        //     $(`#Driver_MI${miNumber}_DriverType_CHOICEP`).val("Licensed");
        // }

        const driverTypeChoice = $(`#Driver_MI${miNumber}_DriverType_CHOICEP`);

        if (driverTypeChoice.length > 0) {
          driverTypeChoice.val("Licensed");
        }
      }
    }
  }

  // Function to hide "Driver Credits" header based on driver type selection
  function hideDispHead(container, miNumber) {
    function hideDispHeadLogic() {
      $(".shwUndDri").each(function () {
        // Only select <select> inside .instanda-question-parent-yes-no
        var selectElement = $(this).find(
          ".instanda-question-parent-yes-no select"
        );
        var selectedValue = selectElement.val();
        var dispHead = container.querySelector(".dispHead");
        if (
          selectedValue === "Licensed" ||
          selectedValue === "Undisclosed" ||
          selectedValue === ""
        ) {
          $(dispHead).hide();
        } else {
          $(dispHead).show();
        }
      });
    }
    hideDispHeadLogic();
    // Only listen to changes on <select> inside .instanda-question-parent-yes-no
    $(".shwDriHead .instanda-question-parent-yes-no select").on(
      "change",
      function () {
        hideDispHeadLogic();
      }
    );
  }

  // Function to set Driver Type = "Licensed" during renewal if Driver Type is "Undisclosed"
  $(document).ready(function () {
    if (Instanda.Variables.CreatedFrom === "Renewal") {
      $(".shwLicRenew").each(function () {
        // Only select <select> inside .instanda-question-parent-yes-no
        var selected = $(this).find(".instanda-question-parent-yes-no select");
        var selectedOp = selected.val()?.trim();
        if (selectedOp === "Undisclosed") {
          selected.val("Licensed").trigger("change").trigger("input");
        }
      });
    }
  });

  // Function to disable Order Insurance Risk Score for DE CA AK
  $(document).ready(function () {
    /*if (
      Instanda.Variables.ConvertedPolicy_YN === "Yes" &&
      Instanda.Variables.CreatedFrom === "NewBusiness"
    )
      return; // disable the condition in converted policy
*/
    if (
      Instanda.Variables.PremiumState_CHOICE === "Delaware" ||
      Instanda.Variables.PremiumState_CHOICE === "California" ||
      Instanda.Variables.PremiumState_CHOICE === "Alaska" // BH-27338
    ) {
      $('input[name^="OrderInsRiskScore_YN"]').prop("disabled", true);
    } else {
      $('input[name^="OrderInsRiskScore_YN"]').prop("disabled", false);
    }
  });

  //functions for infraction details - driver screen

  $(document).ready(function () {
    if (
      document.querySelector(
        ".page-quickquotequestions.page-number-2.package-24338"
      )
    ) {
      const maxDrivers = 40;
      const maxInfractions = 20;

      //Set Yes/No radio
      function setNoInYN(yesEl, noEl) {
        yesEl
          .prop("checked", false)
          .parent()
          .removeClass("instanda-selected")
          .addClass("instanda-unselected");
        noEl
          .prop("checked", true)
          .parent()
          .removeClass("instanda-unselected")
          .addClass("instanda-selected");
      }

      //Select dropdown value
      function selectElementValue($select, value) {
        if ($select.val() !== value && $select.val() !== null) {
          $select.val(value).change();
        }
      }

      //Set element as not required and clear
      function setElementNotRequired($question, $value) {
        selectElementValue($value, "");
        $value.attr("required", false);
      }

      // Main: Apply rules for a single infraction
      function applyInfractionRules(driverIdx, infractionIdx) {
        const prefix = `#Driver_MI${driverIdx}_Infraction${infractionIdx}_`;

        const $faultInd = $(`${prefix}FaultInd_CHOICE`);
        const $faultIndQ = $faultInd.closest(".instanda-question-item");
        const $addYes = $(`${prefix}Add_YNPYes`);
        const $addNo = $(`${prefix}Add_YNPNo`);
        const $source = $(`${prefix}Source_TXT`);
        const $type = $(`${prefix}Type_CHOICEP`);
        const $infraction = $(`${prefix}CHOICE`);
        const $recklessYes = $(`${prefix}RecklessDrivingDeath_YNYes`);
        const $recklessNo = $(`${prefix}RecklessDrivingDeath_YNNo`);
        const $recklessQ = $recklessYes.closest(".instanda-question-item");

        // Set Source
        function setSource() {
          if ($addYes.prop("checked") && $source.val() == "")
            $source.val("Manual");
          else if ($addNo.prop("checked")) $source.val("");
        }

        // Show/hide Fault Indicator
        function showFaultIndicator() {
          if ($type.val() === "Accident" && $source.val() !== "Manual") {
            $faultIndQ.show();
          } else {
            selectElementValue($faultInd, "");
            setElementNotRequired($faultIndQ, $faultInd);
            $faultIndQ.hide();
          }
        }

        // Show/hide Reckless Driving Death
        function showHideReckless() {
          if (
            [
              "RECKLESS DRIVING",
              "RECKLESS DRIVING RESULTING IN",
              "RECKLESS DRIVING/NEGLIGENT",
              "RECKLESS DRVNG RESULTING IN BI",
              "RECKLESS DR COND NOT COV",
              "RECKLESS DRIVING - SPEED EXHIBITION",
              "RECKLESS DRIVING/DRAG RACING",
              "RECKLESS DRIVING RESULTING IN INJURY OR DEATH",
            ].includes($infraction.val())
          ) {
            $recklessQ.show();
          } else {
            setNoInYN($recklessYes, $recklessNo);
            $recklessQ.hide();
          }
        }

        // Set Infraction Type
        function setInfractionTypeValue() {
          if ($source.val() === "Manual") {
            $type.css({
              "pointer-events": "none",
              cursor: "not-allowed",
              "background-color": "#eee",
              color: "#888",
            });
            if ($infraction.val().includes("A-")) {
              selectElementValue($type, "Accident");
            } else {
              selectElementValue($type, "Conviction");
            }
          }
        }

        // Initial run
        setSource();
        showHideReckless();
        showFaultIndicator();
        setInfractionTypeValue();
      }

      // event listener to for add infraction button
      document.addEventListener("click", function (e) {
        const label = e.target.closest(".instanda-question-yes-no-parent-yes");
        if (!label) return; // Not a Yes label

        const input = label.querySelector("input");
        if (!input || !input.id) return;

        const Match = input.id.match(/Driver_MI(\d+)_Infraction(\d+)_/);
        if (Match) {
          const driverIdx = Match[1];
          const infractionIdx = Match[2];
          applyInfractionRules(driverIdx, infractionIdx);
        }
      });

      document.addEventListener("change", function (e) {
        if (e.target && e.target.tagName === "SELECT") {
          const selectId = e.target.id;
          const match = selectId.match(
            /^Driver_MI(\d+)_Infraction(\d+)_CHOICE$/
          );
          if (match) {
            const driverIdx = match[1];
            const infractionIdx = match[2];
            applyInfractionRules(driverIdx, infractionIdx);
          }
        }
      });
    }
  });

  // Function for Infraction dropdown
  function initDropdownLogic(container, miNumber) {
    const infraction = container.querySelector(
      `#InfractionDetail_MI${miNumber}_Dr_Infraction_CHOICE`
    );
    const reckdth = container.querySelector(".reckDth");
    const subcategoryLabel = container.querySelector(".reckDth-label"); // Assuming the label has a class .reckDth-label

    if (infraction && reckdth) {
      // Initial state: hide subcategory and remove required attribute and red asterisk

      function infractionLogic() {
        if (infraction.value === "RECKLESS DRIVING") {
          $(reckdth).show();
          $(reckdth).prop("required", true);
        } else {
          $(reckdth).hide();
          $(reckdth).prop("required", false);
        }
      }
      infractionLogic();
      infraction.addEventListener("change", function () {
        infractionLogic();
      });
    }
  }
  // rishika Susp revok date
  function suspRevokDateEmptyMsg(container, miNumber) {
    const suspRevDate = container.querySelector(
      `#Driver_MI${miNumber}_SusRevoDate_DATE`
    );
    console.log("suspRevDate :", suspRevDate);
  }
  // rishika Susp revok date
  // Function to calculate Age and years licensed
  function ageinput(container, miNumber) {
    function ageDriverPrefillLogic() {
      //const dobEffect1 = parseInt(Instanda.Variables.EffectDateYear_TXT, 10);
      const dobEffect1 = new Date(
        Instanda.Variables.EffectiveDate_DATE
      ).getFullYear();
      const dobEffect2 = $(`#Driver_MI${miNumber}_D_DOB_DATE`).val();
      const agePrefill = container.querySelector(
        `#Driver_MI${miNumber}_D_Age_NUM`
      );
      const licenseAge = parseInt(
        $(`#Driver_MI${miNumber}_AgeReceiveLicenseUS_NUM`).val(),
        10
      );
      const yearsLicensedField = container.querySelector(
        `#Driver_MI${miNumber}_YearsLicensed_NUM`
      );
      if (dobEffect2) {
        const parts1 = dobEffect2.split("/");
        if (parts1.length === 3) {
          const years = parseInt(parts1[2], 10);
          const months = parseInt(parts1[0], 10) - 1; // Month is 0-based in JavaScript Date
          const days = parseInt(parts1[1], 10);

          if (agePrefill && dobEffect1 && years > 0 && dobEffect1 > 0) {
            const dob = new Date(years, months, days);
            const effectDate = new Date(dobEffect1, 0, 1); // Assuming effective date is the start of the year

            if (dob > effectDate) {
              // DOB is in the future
              $(agePrefill).val(0);
              $(agePrefill).trigger("change"); //BH-20148
              $(yearsLicensedField).val(0);
            } else {
              let age = dobEffect1 - years;

              // Adjust age if the birthday hasn't occurred yet this year
              const currentDate = new Date(
                dobEffect1,
                new Date().getMonth(),
                new Date().getDate()
              );
              if (currentDate < new Date(dobEffect1, months, days)) {
                age--;
              }

              if (age > 0 && age < 150) {
                $(agePrefill).val(age);
                $(agePrefill).trigger("change"); //BH-20148
                // to check if date picker changes without date change
                console.log("date changed");
              } else {
                $(agePrefill).val("");
                $(agePrefill).trigger("change"); //BH-20148
              }

              // Trigger driverAge logic
              //driverAge(container, miNumber);

              // Calculate Years Licensed
              const yearFraction = age; // Convert milliseconds to years
              const yearsLicensed = Math.floor(yearFraction - licenseAge);
              if (yearsLicensedField) {
                if (yearsLicensed > 0 && yearsLicensed < 150) {
                  $(yearsLicensedField).val(yearsLicensed);
                } else {
                  $(yearsLicensedField).val("0"); // BH-22160 - Set to 0 if invalid
                }
              }
            }
          }
        }
      }
    }

    ageDriverPrefillLogic();

    $(
      `#Driver_MI${miNumber}_D_DOB_DATE, #Driver_MI${miNumber}_AgeReceiveLicenseUS_NUM`
    ).on("change input", function () {
      ageDriverPrefillLogic();
    });

    $(`#Driver_MI${miNumber}_D_DOB_DATE`).on("blur", function () {
      ageDriverPrefillLogic();
    });

    $(document).on("change input", "#EffectDateYear_TXT", function () {
      ageDriverPrefillLogic();
    });

    setInterval(function () {
      const isPickerVisible =
        $("#question480742 .bootstrap-datetimepicker-widget:visible").length >
        0;
      if (!datePickerVisible && isPickerVisible) {
        datePickerVisible = true;
      } else if (datePickerVisible && !isPickerVisible) {
        datePickerVisible = false;
        ageDriverPrefillLogic();
      }
    }, 100);
  }

  // Driver Credits - Age validation
  function driverAge(container, miNumber) {
    const gdStudentCr = container.querySelector(".gdStCr");
    const drTraining = container.querySelector(".drtrain");
    const srOperator = container.querySelector(".SrOpMoVeh");
    const mtrDriver = container.querySelector(".MatureDr");
    const mvehDriver = container.querySelector(".MoVehDri");
    const colGraduate = container.querySelector(".colGradSchol");
    const matOperator = container.querySelector(".matuOperator");
    const drAge = container.querySelector(`#Driver_MI${miNumber}_D_Age_NUM`);
    const maritalStatus = container.querySelector(
      `#Driver_MI${miNumber}_D_MaritalStatus_CHOICE`
    );

    if (drAge) {
      function DrAgeLogic() {
        if (drAge.value < 25 && drAge.value > 0) {
          $(gdStudentCr).show();
          $(gdStudentCr).prop("required", true);
        } else {
          $(gdStudentCr).hide();
          $(gdStudentCr).prop("required", false);
        }

        if (drAge.value < 21 && drAge.value > 0) {
          $(drTraining).show();
          $(drTraining).prop("required", true);
        } else {
          $(drTraining).hide();
          $(drTraining).prop("required", false);
        }

        if (
          (drAge.value >= 55 && drAge.value > 0) ||
          Instanda.Variables.PremiumState_CHOICE === "Ohio"
        ) {
          $(srOperator).show();
          $(srOperator).prop("required", true);
        } else {
          $(srOperator).hide();
          $(srOperator).prop("required", false);
        }

        if (drAge.value >= 55 && drAge.value > 0) {
          $(mtrDriver).show();
          $(mtrDriver).prop("required", true);
        } else {
          $(mtrDriver).hide();
          $(mtrDriver).prop("required", false);
        }

        if (drAge.value >= 55 && drAge.value > 0) {
          $(mvehDriver).show();
          $(mvehDriver).prop("required", true);
        } else {
          $(mvehDriver).hide();
          $(mvehDriver).prop("required", false);
        }

        if (
          drAge.value < 25 &&
          drAge.value > 0 &&
          maritalStatus.value !== "Married"
        ) {
          $(colGraduate).show();
          $(colGraduate).prop("required", true);
        } else {
          $(colGraduate).hide();
          $(colGraduate).prop("required", false);
        }

        if (
          (drAge.value >= 55 &&
            drAge.value > 0 &&
            Instanda.Variables.PremiumState_CHOICE !== "Connecticut") ||
          (drAge.value >= 62 &&
            drAge.value > 0 &&
            Instanda.Variables.PremiumState_CHOICE === "Connecticut")
        ) {
          $(matOperator).show();
          $(matOperator).prop("required", true);
        } else {
          $(matOperator).hide();
          $(matOperator).prop("required", false);
        }
      }

      DrAgeLogic();
      $(
        `#Driver_MI${miNumber}_D_Age_NUM, #Driver_MI${miNumber}_D_MaritalStatus_CHOICE`
      ).on("change input", function () {
        DrAgeLogic();
      });
    }
  }

  // Function for Unverifiable Surcharge
  function UnveriSurc(container, miNumber) {
    const unverifyRec = container.querySelector(
      `#Driver_MI${miNumber}_UnverifyDriRecChargeOverride_CHOICE`
    );
    const unvDrSur = container.querySelector(
      `#Driver_MI${miNumber}_UnverifyDriRecSurcharge_YNP`
    );

    if (unverifyRec && unvDrSur) {
      function UnDrRecSurOverrLogic() {
        if (unverifyRec.value === "Don't Apply Surcharge") {
          $(unvDrSur).val(""); // Use .val() to set value to blank
        }
      }

      UnDrRecSurOverrLogic();
      unverifyRec.addEventListener("change", function () {
        UnDrRecSurOverrLogic();
      });
    }
  }

  // Function to hide "Nonbinary" option
  function hideNonBinaryOptions() {
    $(".shwNonBinry").each(function () {
      var selectedValue = $(this).find("select").val();
      var selectedOption = $(this)
        .find("select")
        .find('option[value="Nonbinary"]');
      var premiumState = Instanda.Variables.PremiumState_CHOICE;
      if (
        premiumState !== "New Jersey" &&
        premiumState !== "New York" &&
        premiumState !== "Virginia"
      ) {
        selectedOption.hide();
      }
    });
  }

  // function to check Modify infraction - Auto Driver screen
  if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
    $(document).ready(function () {
      const MAX_INFRACTIONS = 20;

      $('[id^="Driver_MI"]').each(function () {
        const driverContainer = $(this);
        const driverIdMatch = driverContainer
          .attr("id")
          .match(/Driver_MI(\d+)/);
        if (!driverIdMatch) return;
        const driverIndex = driverIdMatch[1];

        for (let i = 1; i <= MAX_INFRACTIONS; i++) {
          const prefix = `Infraction${i}_`;
          const fieldsToWatch = [
            "CLUEStatus_TXT",
            "AccidentState_CHOICE",
            "ViolationAccident_DATE",
            "Type_CHOICEP",
            "CHOICE",
            "Conviction_DATE",
            "AccidentDeath_YN",
            "RecklessDrivingDeath_YN",
            "BIClaimAmount_NUM",
            "CollClaimAmount_NUM",
            "PDClaimAmount_NUM",
            "OthCollClaimAmount_NUM",
          ];

          fieldsToWatch.forEach((field) => {
            const fieldId = `#Driver_MI${driverIndex}_${prefix}${field}`;
            const $field = $(fieldId);
            if ($field.length) {
              $field.data("original", $field.val());
              $field.on("change", function () {
                safeRun(() => checkInfractionModified(driverIndex, i));
              });
            }
          });

          const sourceId = `#Driver_MI${driverIndex}_${prefix}Source_TXT`;
          $(sourceId).on("change", function () {
            safeRun(() => checkInfractionModified(driverIndex, i));
          });
        }
      });

      function checkInfractionModified(driverIndex, infractionIndex) {
        const prefix = `#Driver_MI${driverIndex}_Infraction${infractionIndex}_`;
        const source = $(`${prefix}Source_TXT`).val();
        if (source !== "Vendor") return;
        const fieldsToCheck = [
          "CLUEStatus_TXT",
          "AccidentState_CHOICE",
          "ViolationAccident_DATE",
          "Type_CHOICEP",
          "CHOICE",
          "Conviction_DATE",
          "AccidentDeath_YN",
          "RecklessDrivingDeath_YN",
          "BIClaimAmount_NUM",
          "CollClaimAmount_NUM",
          "PDClaimAmount_NUM",
          "OthCollClaimAmount_NUM",
        ];

        for (let field of fieldsToCheck) {
          const $field = $(`${prefix}${field}`);
          if (
            $field.length &&
            $field.data("original") !== undefined &&
            $field.val() !== $field.data("original")
          ) {
            $(`${prefix}ModifyInf_YNYes`).prop("checked", true);
            return;
          }
        }
      }
    });
  }

  // function to check if infraction has been modified if selected as YES - Auto Driver Screen
  if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
    $(document).ready(function () {
      const MAX_INFRACTIONS = 20;

      $('[id^="Driver_MI"]').each(function () {
        const driverContainer = $(this);
        const driverIdMatch = driverContainer
          .attr("id")
          .match(/Driver_MI(\d+)/);
        if (!driverIdMatch) return;
        const driverIndex = driverIdMatch[1];

        for (let i = 1; i <= MAX_INFRACTIONS; i++) {
          const prefix = `Infraction${i}_`;
          const fieldsToWatch = [
            "CLUEStatus_TXT",
            "AccidentState_CHOICE",
            "ViolationAccident_DATE",
            "Type_CHOICEP",
            "CHOICE",
            "Conviction_DATE",
            "AccidentDeath_YN",
            "RecklessDrivingDeath_YN",
            "BIClaimAmount_NUM",
            "CollClaimAmount_NUM",
            "PDClaimAmount_NUM",
            "OthCollClaimAmount_NUM",
          ];

          // Store original values
          fieldsToWatch.forEach((field) => {
            const fieldId = `#Driver_MI${driverIndex}_${prefix}${field}`;
            const $field = $(fieldId);
            if ($field.length) {
              $field.data("original", $field.val());
              $field.on("change", function () {
                $field.data("modified", true);
              });
            }
          });

          // Handler for Modify Infraction Yes/No
          const modifyYesId = `#Driver_MI${driverIndex}_${prefix}ModifyInf_YNYes`;
          const modifyNoId = `#Driver_MI${driverIndex}_${prefix}ModifyInf_YNNo`;

          $(modifyYesId).on("change", function () {
            // Only act if user is trying to select "Yes"
            if ($(this).is(":checked")) {
              let anyModified = false;
              for (let field of fieldsToWatch) {
                const $field = $(`#Driver_MI${driverIndex}_${prefix}${field}`);
                if (
                  $field.length &&
                  $field.data("original") !== undefined &&
                  $field.val() !== $field.data("original")
                ) {
                  anyModified = true;
                  break;
                }
              }
              if (!anyModified) {
                alert(
                  'Please modify at least one infraction field before selecting "Modify Infraction?" as "Yes".'
                );
                // Toggle back to "No"
                $(modifyNoId).prop("checked", true);
                $(modifyYesId).prop("checked", false);
              }
            }
          });
        }
      });
    });
  }
  //end of the above function

  // Code for disabling the Modify Infraction fields for broker on second time change - Auto

  if (
    $(".page-quickquotequestions.page-number-2.package-24338").length > 0 &&
    Instanda.Variables.SalespersonReferralLevel <= 3
  ) {
    $(document).ready(function () {
      // Inject CSS for read-only selects
      if (!document.getElementById("readonly-select-style")) {
        var style = document.createElement("style");
        style.id = "readonly-select-style";
        style.textContent = `
                .readonly-select {
                    pointer-events: none !important;
                    cursor: not-allowed !important;
                    background-color: #eee !important;
                    color: #555 !important;
                }
            `;
        document.head.appendChild(style);
      }

      const MAX_INFRACTIONS = 20;

      $('[id^="Driver_MI"]').each(function () {
        const driverContainer = $(this);
        const driverIdMatch = driverContainer
          .attr("id")
          .match(/Driver_MI(\d+)/);
        if (!driverIdMatch) return;
        const driverIndex = driverIdMatch[1];

        for (let i = 1; i <= MAX_INFRACTIONS; i++) {
          const prefix = `Infraction${i}_`;
          const fieldsToDisable = [
            "CLUEStatus_TXT",
            "AccidentState_CHOICE",
            "ViolationAccident_DATE",
            "Type_CHOICEP",
            "CHOICE",
            "Conviction_DATE",
            "AccidentDeath_YN",
            "RecklessDrivingDeath_YN",
            "BIClaimAmount_NUM",
            "CollClaimAmount_NUM",
            "PDClaimAmount_NUM",
            "OthCollClaimAmount_NUM",
          ];

          const modifyYesId = `#Driver_MI${driverIndex}_${prefix}ModifyInf_YNYes`;
          const modifyNoId = `#Driver_MI${driverIndex}_${prefix}ModifyInf_YNNo`;

          if ($(modifyYesId).is(":checked")) {
            fieldsToDisable.forEach((field) => {
              const fieldId = `#Driver_MI${driverIndex}_${prefix}${field}`;
              const $field = $(fieldId);

              if ($field.length) {
                if (
                  $field.is('input[type="text"]') ||
                  $field.is('input[type="number"]') ||
                  $field.hasClass("instanda-date-picker")
                ) {
                  $field.prop("readonly", true);
                  if (
                    $field.hasClass("instanda-date-picker") &&
                    $field.datepicker
                  ) {
                    $field.datepicker("disable");
                  }
                } else if ($field.is("select")) {
                  // Apply read-only style and block interaction for selects
                  $field.addClass("readonly-select");
                  // Optionally, prevent keyboard navigation as well
                  $field.on("keydown", function (e) {
                    e.preventDefault();
                  });
                } else {
                  $field.prop("disabled", true);
                }
              }
            });

            $(modifyYesId).on("click mousedown", function (e) {
              e.preventDefault();
            });
            $(modifyNoId).on("click mousedown", function (e) {
              e.preventDefault();
            });
          }
        }
      });
    });
  }

  // end of the above modify infraction code

  // Function to hide "Undisclosed" option from Driver Type
  function hideDriverDropdownOptions() {
    $(".shwUndDri").each(function () {
      var premiumState = Instanda.Variables.PremiumState_CHOICE;
      var createdFrom = Instanda.Variables.CreatedFrom;
      var selectedUndisclosed = $(this)
        .find("select")
        .find('option[value="Undisclosed"]');
      var selectedUndisclosedDriver = $(this)
        .find("select")
        .find('option[value="Undisclosed Driver"]');
      var selectedOptionPermit = $(this)
        .find("select")
        .find('option[value="Permit"]');

      if (premiumState !== "New Jersey") {
        selectedUndisclosedDriver.hide();
      } else {
        selectedUndisclosedDriver.show();
      }

      if (
        premiumState !== "Pennsylvania" &&
        premiumState !== "Texas" &&
        premiumState !== "Florida" &&
        premiumState !== "South Carolina" &&
        premiumState !== "North Carolina" &&
        premiumState !== "New York"
      ) {
        selectedOptionPermit.hide();
      } else {
        selectedOptionPermit.show();
      }

      if (
        premiumState !== "Pennsylvania" &&
        premiumState !== "Texas" &&
        premiumState !== "Florida" &&
        premiumState !== "South Carolina"
      ) {
        selectedUndisclosed.hide();
      }

      if (
        premiumState === "Pennsylvania" ||
        premiumState === "Texas" ||
        premiumState === "Florida" ||
        (premiumState === "South Carolina" && createdFrom !== "NewBusiness")
      ) {
        selectedUndisclosed.show();
      }
    });
  }

  // Function to hide Marital Status dropdown values
  function hideMariStsDropdownOptions() {
    console.log("hideMariStsDropdownOptions function called");
    $(".showMaritalStsVal").each(function () {
      var selectElement = $(this).find("select");
      var selectedOptionSep = selectElement.find('option[value="Separated"]');
      var selectedOptionCoh = selectElement.find(
        'option[value="Cohabitation"]'
      );
      var selectedOptionDom = selectElement.find(
        'option[value="Domestic Partnership"]'
      );
      var selectedOptionCiU = selectElement.find('option[value="Civil union"]');

      if (Instanda.Variables.MaritalStatus_State) {
        selectedOptionSep.hide();
      }

      if (Instanda.Variables.MaritalStatus_StateTX) {
        selectedOptionCoh.hide();
        selectedOptionDom.hide();
        selectedOptionCiU.hide();
      }
    });
    console.log("hideMariStsDropdownOptions function called");
  }

  // Function to default only one insured for Relationship to Insured
  function setDefaultOptionForRelInsFirstItem() {
    console.log("setDefaultOptionForRelInsFirstItem function called");
    var firstSelectElement = $("#Driver_MI1_RelationToInsured_CHOICE");

    if (!firstSelectElement.val()) {
      firstSelectElement.val(
        firstSelectElement.find('option[value="Insured"]').val()
      );
    }
    console.log("setDefaultOptionForRelInsFirstItem function ended");
  }

  // Function to set "Licensed" default for Driver Type
  function setDefaultOptionDriverType() {
    $(".setLicDef").each(function () {
      // Only select <select> inside .instanda-question-parent-yes-no
      var selectElement = $(this).find(
        ".instanda-question-parent-yes-no select"
      );
      if (selectElement.val() === "")
        selectElement
        .val(selectElement.find('option[value="Licensed"]').val())
        .trigger("change");
    });
  }


  // Fault Indicator
  function faultIndicatorLogic(container, miNumber) {
    const infractionType = container.querySelector(
      `#InfractionDetail_MI${miNumber}_InfractionType_CHOICEP`
    );
    const FltIndi = container.querySelector(".fltIndi");
    const Srce = container.querySelector(
      `#InfractionDetail_MI${miNumber}_Dr_InfrDetail_Src_TXT`
    ); // Assuming the label has a class .reckDth-label

    if (infractionType && FltIndi && Srce) {
      function infractionTypeLogic() {
        if (infractionType.value === "Accident" && Srce.value !== "Manual") {
          $(FltIndi).show();
          $(FltIndi).prop("required", true);
        } else {
          $(FltIndi).hide();
          $(FltIndi).prop("required", false);
        }
      }
      infractionTypeLogic();
      infractionType.addEventListener("change", function () {
        infractionTypeLogic();
      });
    }
  }

  safeRun(() => hideNonBinaryOptions());
  safeRun(() => hideDriverDropdownOptions());
  safeRun(() => hideMariStsDropdownOptions());
  safeRun(() => setDefaultOptionForRelInsFirstItem());
  safeRun(() => setDefaultOptionDriverType());
  safeRun(() => handleInfractions());
  //setupDropdownsForAssignments();
  //RenewalCallCourseVal();

  // Function to set marital Status as "Married"

  function setMaritalStatus() {
    $('[class*="instanda-multi-item-Driver_MI"]')
      .off(
        "change.maritalDefault",
        '[id^="Driver_MI"][id$="_RelationToInsured_CHOICE"]'
      )
      .on(
        "change.maritalDefault",
        '[id^="Driver_MI"][id$="_RelationToInsured_CHOICE"]',
        function () {
          // Extract miNumber from the element's ID
          const idMatch = this.id.match(
            /^Driver_MI(\d+)_RelationToInsured_CHOICE$/
          );
          if (!idMatch) {
            return;
          }
          const miNumber = idMatch[1];

          // Find the corresponding marital status dropdown
          const $marital = $(`#Driver_MI${miNumber}_D_MaritalStatus_CHOICE`);
          if ($marital.length === 0) {
            console.log("Marital status dropdown not found for:", miNumber);
            return;
          }

          const relationVal = $(this).val();

          if (relationVal === "Husband" || relationVal === "Wife") {
            $marital.val("Married").trigger("change");
          } else {
            $marital.val("").trigger("change");
          }
        }
      );
  }
  safeRun(() => setMaritalStatus());

  // Added new perf improvement
  // AUTO - Vehicle functions onwards
  //function to make Vehicle Owned or Leased defaulted to Owned

  $(document).ready(function () {
    if (
      !document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24338"
      )
    )
      return;
    const processed = new Set();

    // Helper: extract MI number from container class
    const getMI = (container) => {
      const match = container.className.match(
        /instanda-multi-item-Vehicle_MI(\d+)/
      );
      return match ? parseInt(match[1]) : null;
    };

    // Date formatter used in several places
    window.formatDateToMMDDYYYY = (dateStr) => {
      if (!dateStr) return "";
      const d = new Date(dateStr);
      if (isNaN(d)) return "";
      return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
        d.getDate()
      ).padStart(2, "0")}/${d.getFullYear()}`;
    };

    // ====================== ALL YOUR FUNCTIONS (optimized) ======================

    function VehOwnedLeasedDefCM() {
      const owned = document.querySelector(
        "label:has(#IsVehOwnedOrLeasedCm_CHOICEOwned)"
      );
      if (owned && !owned.classList.contains("instanda-selected")) {
        owned.click();
      }
    }

    function VehOwnedLeasedDefMI(mi) {
      const owned = document.querySelector(
        `label:has(#Vehicle_MI${mi}_IsVehOwnedOrLeasedMI_CHOICEOwned)`
      );
      if (owned && !owned.classList.contains("instanda-selected")) {
        owned.click();
      }
    }

    function EffectiveDef(mi) {
      const $field = $(`#Vehicle_MI${mi}_V_EffectiveDate_DATE`);
      if (!$field.length) return;

      let dateVal = Instanda.Variables.EffectiveDate_DATE;

      if (
        $(".created-from-mta").length &&
        mi > (Instanda.Variables.Vehicle_MI_Count || 0)
      ) {
        dateVal = Instanda.Variables.EffectiveChangeDate || dateVal;
      }
      $field.val(formatDateToMMDDYYYY(dateVal));
    }

    function CollectorVehMake(mi) {
      const container = document.querySelector(
        `[class*="instanda-multi-item-Vehicle_MI${mi}"]`
      );
      if (!container) return;
      const vehType = container.querySelector(
        `#Vehicle_MI${mi}_VehType_CHOICEP`
      );
      const make = container.querySelector(`#Vehicle_MI${mi}_VehMake_CHOICE`);
      const block = container.querySelector(".collecmake");
      const input = block?.querySelector("input");
      if (!vehType || !make || !block) return;

      const logic = () => {
        const show = [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
        ].includes(vehType.value) && make.value === "COLLECTOR - OTHER";
        block.classList.toggle("hidden", !show);
        if (input) input.required = show;
      };
      logic();

      vehType.addEventListener("change", logic);
      make.addEventListener("change", logic);
    }

    function HideMilesDriven(mi) {
      applyMilesDaysLogic(mi, ".milesdrive");
    }

    function HideDaysWeek(mi) {
      applyMilesDaysLogic(mi, ".daysweek");
    }

    function applyMilesDaysLogic(mi, selector) {
      const container = document.querySelector(
        `[class*="instanda-multi-item-Vehicle_MI${mi}"]`
      );
      if (!container) return;
      const block = container.querySelector(selector);
      const vehType = container.querySelector(
        `#Vehicle_MI${mi}_VehType_CHOICEP`
      );
      const use = container.querySelector(`#Vehicle_MI${mi}_VehUse_CHOICE`);
      if (!block || !vehType || !use) return;

      const logic = () => {
        const hide = [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
        ].includes(vehType.value) || ["Farm", "Pleasure"].includes(use.value);
        block.classList.toggle("hidden", hide);
        $(block).find("input").prop("required", !hide);
      };
      logic();

      vehType.addEventListener("change", logic);
      use.addEventListener("change", logic);
    }

    // Max length 4 on miles driven, block non-numeric input
    $(".milesdrive input")
      .attr("maxlength", 4)
      .on("keypress", function (e) {
        if (e.which < 48 || e.which > 57) e.preventDefault();
      });

    function HideSnowmobile(mi) {
      const container = document.querySelector(
        `[class*="instanda-multi-item-Vehicle_MI${mi}"]`
      );
      if (!container) return;
      const vehType = container.querySelector(
        `#Vehicle_MI${mi}_VehType_CHOICEP`
      );
      const make = container.querySelector(`#Vehicle_MI${mi}_VehMake_CHOICE`);
      const block = container.querySelector(".snowlight");
      if (!block || !vehType) return;

      const logic = () => {
        const show =
          vehType.value === "Misc. - Snowmobile" ||
          (make && make.value === "Snowmobile");
        block.style.display = show ? "" : "none";
        $(block).find("input").prop("required", show);
      };
      logic();

      vehType.addEventListener("change", logic);
      if (make) make.addEventListener("change", logic);
    }

    function MultiCarCredit() {
      const block = document.querySelector(".multiCar");
      if (!block) return;

      const state = Instanda.Variables.PremiumState_CHOICE;
      const level = Instanda.Variables.SalespersonReferralLevel ?? 999;
      const isBroker = level <= 3;

      const hideStates = [
        "Florida",
        "Texas",
        "Colorado",
        "Connecticut",
        "Idaho",
        "Alabama",
        "Tennessee",
        "Illinois",
        "Georgia",
        "Missouri",
        "Montana",
        "Indiana",
        "Wyoming",
        "Pennsylvania",
        "Kentucky",
        "Louisiana",
        "Wisconsin",
        "Oklahoma",
        "Rhode Island",
        "Hawaii",
        "Arizona",
        "New Hampshire",
        "Ohio",
        "Arkansas",
        "Oregon",
        "Virginia",
        "North Carolina",
        "Utah",
        "Washington",
        "Kansas",
        "Minnesota",
        "Maryland",
        "Michigan",
      ];
      const multiCarOverride = $(
        "input[type='radio'][name^='MultiCarOverride_YN']"
      );
      const overrideParent = $(multiCarOverride).closest(".questionItem");
      if (isBroker && hideStates.includes(state)) {
        block.classList.add("hidden");
        $(overrideParent).addClass("hidden");
        $(block).find("input").prop("required", false);
      } else {
        if (state !== "California") {
          $(block).find("input").attr("disabled", true);
        } else {
          // If california
          block.classList.remove("hidden", "readonly");
          $(multiCarOverride).each((i, item) => {
            if (item.value === "Yes" && !item.checked) {
              $(item).prop("checked", true).trigger("change");
            }
          });
          $(block).find("input").removeAttr("disabled");
          overrideParent.addClass("hidden");
        }
      }

      // console.log(multiCarOverride);
      function setMulticarOverrideFunctionlity(currentItem, isChange) {
        const $container = $(currentItem).closest(".questionItem").parent();
        const multiCarCreditYN = $container.find(
          "input[type='radio'][name^='MultiCarCredit_YN']"
        );

        if ($(currentItem).val() == "Yes") {
          $(multiCarCreditYN).removeAttr("disabled");
        } else {
          $(multiCarCreditYN).attr("disabled", true);
          if (isChange) {
            handleMultiCarRegularLogic(null);
          }
        }
      }
      if (state != "California") {
        multiCarOverride.off("change").on("change", function () {
          setMulticarOverrideFunctionlity($(this), true);
        });
        multiCarOverride.each((_, item) => {
          if (item.checked) {
            setMulticarOverrideFunctionlity(item, false);
          }
        });
      }
    }

    function GaragedAtSecMI(mi) {
      const zipInput = document.querySelector(
        `input[name="GaragingPostcodeMI_NUM__24354__${mi}"]`
      );
      if (!zipInput) return;
      const primaryZip = Instanda.Variables.MA_Zip_NUM || "";
      const yesLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_GaragedAtSecLocationMI_YNYes)`
      );
      const noLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_GaragedAtSecLocationMI_YNNo)`
      );

      const logic = () => {
        const sameZip = zipInput.value.trim() === primaryZip;
        if (sameZip && yesLabel?.classList.contains("instanda-selected")) {
          noLabel?.click();
        }
        const q = document.getElementById("question483444");
        if (q) q.classList.toggle("hidden", sameZip);
      };
      logic();

      zipInput.addEventListener("input", logic);
    }

    const floridaCoastalZips = new Set([
      "33001",
      "33040",
      "33042",
      "33043",
      "33050",
      "33070",
      "32034",
      "32169",
      "32080",
      "32082",
      "32084",
      "32086",
      "32097",
      "32114",
      "32117",
      "32118",
      "32119",
      "32127",
      "32129",
      "32132",
      "32136",
      "32137",
      "32176",
      "32225",
      "32226",
      "32227",
      "32233",
      "32250",
      "32266",
      "32754",
      "32759",
      "32775",
      "32780",
      "32796",
      "32901",
      "32903",
      "32905",
      "32922",
      "32925",
      "32935",
      "32937",
      "32949",
      "32950",
      "32951",
      "32952",
      "32953",
      "32958",
      "32960",
      "32962",
      "32963",
      "33009",
      "33019",
      "33032",
      "33033",
      "33034",
      "33035",
      "33062",
      "33130",
      "33133",
      "33136",
      "33137",
      "33138",
      "33139",
      "33140",
      "33141",
      "33143",
      "33145",
      "33146",
      "33149",
      "33156",
      "33157",
      "33158",
      "33160",
      "33180",
      "33181",
      "33189",
      "33190",
      "33301",
      "33304",
      "33305",
      "33306",
      "33308",
      "33316",
      "33401",
      "33403",
      "33404",
      "33405",
      "33407",
      "33408",
      "33431",
      "33432",
      "33435",
      "33441",
      "33455",
      "33460",
      "33462",
      "33469",
      "33477",
      "33480",
      "33483",
      "33487",
      "33994",
      "34946",
      "34949",
      "34950",
      "34952",
      "34957",
      "34982",
      "34996",
      "34997",
      "32320",
      "32322",
      "32327",
      "32328",
      "32346",
      "32347",
      "32358",
      "32359",
      "32403",
      "32404",
      "32405",
      "32407",
      "32413",
      "32439",
      "32444",
      "32456",
      "32459",
      "32508",
      "32541",
      "32548",
      "32561",
      "32566",
      "32569",
      "32625",
      "32692",
      "33534",
      "33570",
      "33602",
      "33609",
      "33611",
      "33615",
      "33619",
      "33621",
      "33629",
      "33635",
      "33677",
      "33701",
      "33703",
      "33704",
      "33707",
      "33708",
      "33710",
      "33711",
      "33716",
      "33755",
      "33756",
      "33764",
      "33770",
      "33772",
      "33774",
      "33901",
      "33904",
      "33908",
      "33914",
      "33919",
      "33922",
      "33924",
      "33931",
      "33946",
      "33948",
      "33950",
      "33953",
      "33956",
      "33981",
      "33990",
      "33993",
      "34103",
      "34108",
      "34112",
      "34113",
      "34114",
      "34134",
      "34138",
      "34139",
      "34141",
      "34145",
      "34209",
      "34210",
      "34221",
      "34223",
      "34224",
      "34228",
      "34229",
      "34231",
      "34236",
      "34237",
      "34239",
      "34242",
      "34243",
      "34285",
      "34293",
      "34428",
      "34429",
      "34498",
      "34607",
      "34608",
      "34668",
      "34683",
      "34689",
      "34691",
      "34695",
      "34698",
    ]);

    function HideStoredmasonryMI(mi) {
      const container = document.querySelector(
        `[class*="instanda-multi-item-Vehicle_MI${mi}"]`
      );
      if (!container) return;
      const block = container.querySelector(".storedMasonry");
      if (!block) return;

      const vehType = container.querySelector(
        `#Vehicle_MI${mi}_VehType_CHOICEP`
      );
      const state = container.querySelector(
        `#Vehicle_MI${mi}_GaragingStateMI_TXT`
      );
      const zip = document.querySelector(
        `input[name="GaragingPostcodeMI_NUM__24354__${mi}"]`
      );
      const garagedYes = document.querySelector(
        `label:has(#Vehicle_MI${mi}_IsVehGaragedMI_YNYes)`
      );

      const logic = () => {
        const show = [
            "Collector - Antique",
            "Collector - Classic",
            "Collector - Exotic",
          ].includes(vehType?.value) &&
          garagedYes?.classList.contains("instanda-selected") &&
          state?.value === "FL" &&
          floridaCoastalZips.has(zip?.value);
        block.classList.toggle("hidden", !show);
        $(block).find("input").prop("required", show);
      };
      logic();
      [vehType, state, zip].forEach((el) =>
        el?.addEventListener("change", logic)
      );
      $(container).find(".vehgar input[type=radio]").on("change", logic);
    }

    function showExtended(mi) {
      if (
        Instanda.Variables.PremiumState_CHOICE !== "New Jersey" ||
        Instanda.Variables.PolicyType_CHOICE !== "BASIC"
      )
        return;
      const noLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_ExtendNonOwnVehReg_YNNo)`
      );
      if (noLabel && !noLabel.classList.contains("instanda-selected")) {
        noLabel.click();
        document.querySelector(".extend")?.classList.add("readonly");
      }
    }

    function ReportedFirstPoten(mi) {
      if (Instanda.Variables.PremiumState_CHOICE !== "Pennsylvania") return;
      const noLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_ReportFirstPotenDamage_YNNo)`
      );
      if (noLabel && !noLabel.classList.contains("instanda-selected"))
        noLabel.click();
    }

    function RegisState(mi) {
      if ($(`#Vehicle_MI${mi}_RegisState_CHOICE`).val() === "") {
        $(`#Vehicle_MI${mi}_RegisState_CHOICE`).val(
          Instanda.Variables.PremiumState_CHOICE
        );
      }
    }

    function miVehicleType(mi) {
      const $dropdown = $(`#Vehicle_MI${mi}_VehType_CHOICEP`);
      const $options = $dropdown.find("option");

      const state = Instanda.Variables.PremiumState_CHOICE;
      const policy = Instanda.Variables.PolicyType_CHOICE;

      const inceptionDateObj = parseInstandaDate(
        Instanda.Variables.InceptionDate_DATE
      );
      const cutoff = new Date(2019, 4, 1); // May 1, 2019
      const hasValidInceptionDate = !Number.isNaN(inceptionDateObj.getTime());

      const isNY = state === "New York";
      const isNJB = state === "New Jersey" && policy === "BASIC";
      const isNYGLM25 =
        isNY && hasValidInceptionDate && inceptionDateObj >= cutoff; // NY GLM 2.5
      const isNYOrg =
        isNY && hasValidInceptionDate && inceptionDateObj < cutoff; // NY pre-cutoff ("NY Org")

      const show = (val) => $options.filter(`[value="${val}"]`).show();
      const hide = (val) => $options.filter(`[value="${val}"]`).hide();

      // Start: hide everything, always show Regular
      $options.hide();
      show("Regular");

      const allowIfNotNJB = !isNJB;
      const allowInNYOrg = !isNY || isNYOrg; // for rules: "exclude NY GLM 2.5" (NY allowed only pre-cutoff)
      const inPA_SC_TX = ["Pennsylvania", "South Carolina", "Texas"].includes(
        state
      );

      // Collector - Antique/Classic/Exotic: All (except NJ Basic)
      if (allowIfNotNJB) {
        [
          "Collector - Antique",
          "Collector - Classic",
          "Collector - Exotic",
        ].forEach(show);
      }

      // Misc. - Motorcycle/Other Trailer/Recreational Trailer/Snowmobile: All (except NJ Basic)
      if (allowIfNotNJB) {
        [
          "Misc. - Motorcycle",
          "Misc. - Other Trailer",
          "Misc. - Recreational Trailer",
          "Misc. - Snowmobile",
        ].forEach(show);
      }

      // Misc. - All Terrain Vehicle: All except NC & NJ Basic
      if (state !== "North Carolina" && allowIfNotNJB) {
        show("Misc. - All Terrain Vehicle");
      }

      // Misc. - Electric Auto:
      // All except FL, NC, NJ, PA, SC, TX, VA; and NY only for GLM 2.5
      const electricAutoExcluded = [
        "Florida",
        "North Carolina",
        "New Jersey",
        "Pennsylvania",
        "South Carolina",
        "Texas",
        "Virginia",
      ].includes(state);
      if (!electricAutoExcluded && !isNYGLM25) show("Misc. - Electric Auto");
      //if (isNYOrg) show("Misc. - Electric Auto");

      // Misc. - Golf Cart + Nonreg. Golf Cart:
      // All except PA, SC, TX, NY-GLM 2.5 & NJ Basic
      if (allowIfNotNJB && !inPA_SC_TX && !isNYGLM25) {
        show("Misc. - Golf Cart");
        show("Misc. - Nonreg. Golf Cart");
      }
      // Misc. - Nonreg. Dune Buggy:
      // All except NC, PA, SC, TX, NY-GLM 2.5 & NJ Basic
      if (
        allowIfNotNJB &&
        !["North Carolina", "Pennsylvania", "South Carolina", "Texas"].includes(
          state
        ) &&
        allowInNYOrg
      ) {
        show("Misc. - Nonreg. Dune Buggy");
      }

      // Reg Dune Buggy (non-misc):
      // All except NC, PA, SC, TX, NY-GLM 2.5 & NJ Basic
      if (
        allowIfNotNJB &&
        !["North Carolina", "Pennsylvania", "South Carolina", "Texas"].includes(
          state
        ) &&
        allowInNYOrg
      ) {
        show("Reg Dune Buggy");
      }

      // Motor Home (non-misc):
      // All except NC, PA, SC, TX, NY GLM 2.5
      if (
        !["North Carolina", "Pennsylvania", "South Carolina", "Texas"].includes(
          state
        ) &&
        allowInNYOrg
      ) {
        show("Motor Home");
      }

      // Misc. - Low Speed Vehicle: NC, NY GLM 2.5, PA, SC, TX
      if (
        ["North Carolina", "Pennsylvania", "South Carolina", "Texas"].includes(
          state
        ) ||
        isNYGLM25
      ) {
        show("Misc. - Low Speed Vehicle");
      }

      // NY GLM 2.5, PA, SC, TX-only set
      if (inPA_SC_TX || isNYGLM25) {
        [
          "Misc. - Moped",
          "Misc. - Motor Home",
          "Misc. - Other Registered Vehicle",
          "Misc. - Other Unregistered Vehicle",
          "Misc. - Registered Dune Buggy",
          "Misc. - Registered Golf Cart",
          "Misc. - Unregistered Dune Buggy",
          "Misc. - Unregistered Golf Cart",
        ].forEach(show);
      }

      // NC-only items
      if (state === "North Carolina") {
        [
          "Misc. - Comm Type Motorcycle",
          "Misc. - Display Trailer",
          "Misc. - Home Trailer",
          "Misc. - Motorscooter",
          "Misc. - Office Trailer",
          "Misc. - Store Trailer",
        ].forEach(show);

        // Ensure Exotic is not available in NC
        hide("Collector - Exotic");
      }

      // High Value Collectible logic
      const stateDates = {
        Illinois: "06/01/2025",
        Connecticut: "06/01/2025",
        Missouri: "08/06/2025",
        Oklahoma: "08/06/2025",
        Florida: "08/06/2025",
        Arkansas: "09/15/2025",
        Montana: "09/15/2025",
        Virginia: "09/15/2025",
        Tennessee: "09/15/2025",
        Texas: "12/17/2025",
        Utah: "11/05/2025",
      };

      const effDate = formatDateToMMDDYYYY(
        Instanda.Variables.EffectiveDate_DATE
      );

      if (
        stateDates[state] &&
        new Date(effDate) >= new Date(stateDates[state])
      ) {
        $options.filter('[value="Collector - High Value Collectible"]').show();
        $options.filter('[value="Collector - Exotic"]').hide();

        if ($dropdown.val() === "Collector - Exotic") {
          $dropdown.val("Collector - High Value Collectible").trigger("change");
        }
      } else {
        if (state !== "North Carolina" && allowIfNotNJB) {
          $options.filter('[value="Collector - Exotic"]').show();
        }
        $options.filter('[value="Collector - High Value Collectible"]').hide();

        if ($dropdown.val() === "Collector - High Value Collectible") {
          $dropdown.val("Collector - Exotic").trigger("change");
        }
      }
    }

    function modelYear(mi) {
      const $field = $(`#Vehicle_MI${mi}_ModYear_NUM`);
      if (!$field.length) return;
      const isNNO = Instanda.Variables.NamedNonOwnPol_YN === "Yes";
      const isNBorRenew =
        $(".created-from-newbusiness,.created-from-renewal").length > 0;

      if (isNBorRenew && isNNO) {
        $field.val(new Date().getFullYear()).css({
          "pointer-events": "none",
          "background-color": "#eee",
          cursor: "not-allowed",
          color: "#888",
        });
      } else if (isNBorRenew) {
        $field.css({
          "pointer-events": "",
          "background-color": "",
          cursor: "",
          color: "",
        });
      }
    }

    function miReadonly(mi) {
      if (Instanda.Variables.VehReadOnly_TXT !== "true") return;
      if (Instanda.Variables.ConvertedPolicy_YN !== "Yes")
        //BH-27263
        $(
          `#Vehicle_MI${mi}_MarketValOverride_NUM, #Vehicle_MI${mi}_AgreedVal_NUM`
        ).css({
          "pointer-events": "none",
          "background-color": "#eee",
          cursor: "not-allowed",
        });

      if (
        Instanda.Variables.ConvertedPolicy_YN !== "Yes" &&
        Instanda?.Variables?.SalespersonReferralLevel < 4
      ) {
        //BH-27263
        $(`#Vehicle_MI${mi}_MarketVal_NUM`).css({
          "pointer-events": "none",
          "background-color": "#eee",
          cursor: "not-allowed",
        });
      }
    }

    function displayMarketValOverride(mi) {
      const $q = $(`#Vehicle_MI${mi}_MarketValOverride_NUM`).closest(
        ".instanda-question-item"
      );
      const isCollector = [
        "Collector - Antique",
        "Collector - Classic",
        "Collector - Exotic",
      ].includes($(`#Vehicle_MI${mi}_VehType_CHOICEP`).val());
      $q.toggle(!isCollector);
    }

    function VehHeightBroker(mi) {
      const level = Instanda.Variables.SalespersonReferralLevel || 999;
      const state = Instanda.Variables.PremiumState_CHOICE;
      const $q = $(`#Vehicle_MI${mi}_VehHeight_TXT`).closest(
        ".instanda-question-item"
      );
      if (level <= 3 && (state === "Maryland" || state === "Michigan")) {
        $q.hide();
        $(`#Vehicle_MI${mi}_VehHeight_TXT`).prop("required", false);
      } else {
        $q.show();
        $(`#Vehicle_MI${mi}_VehHeight_TXT`).prop("required", true);
      }
    }

    function ModelAndBodyStyle(mi) {
      const isNNO = Instanda.Variables.NamedNonOwnPol_YN === "Yes";
      const $model = $(`#Vehicle_MI${mi}_Model_TXT`);
      const $body = $(`#Vehicle_MI${mi}_BodyStyle_TXT`);
      if (isNNO) {
        $model.val("Named Non-Owned").trigger("change").css({
          "pointer-events": "none",
          background: "#eee",
          cursor: "not-allowed",
        });
        $body.val("Named Non-Owned").trigger("change").css({
          "pointer-events": "none",
          background: "#eee",
          cursor: "not-allowed",
        });
      } else {
        $model.add($body).css({
          "pointer-events": "",
          background: "",
          cursor: "",
        });
      }
    } // Add this closing brace (was missing)

    function MaxOperateSpeed(mi) {
      const state = Instanda.Variables.PremiumState_CHOICE;
      const rating = Instanda.Variables.RatingStructure1_TXT; // unused (ok)
      const $vehType = $(`#Vehicle_MI${mi}_VehType_CHOICEP`);
      const $field = $(`#Vehicle_MI${mi}_MaxOperatingSpeed_NUM`);
      const $q = $field.closest(".instanda-question-item");

      const inceptionDateObj = parseInstandaDate(
        Instanda.Variables.InceptionDate_DATE
      );
      const cutoff = new Date(2019, 4, 1); // May 1, 2019
      const hasValidInceptionDate = !Number.isNaN(inceptionDateObj.getTime());

      const logic = () => {
        const isMotorcycle = $vehType.val() === "Misc. - Motorcycle";

        const show = ["Pennsylvania", "Texas", "South Carolina"].includes(state) &&
          isMotorcycle;

        const show1 =
          state === "New York" &&
          isMotorcycle &&
          hasValidInceptionDate &&
          inceptionDateObj >= cutoff;

        if (show || show1) {
          $q.show();
          $field.prop("required", true);
        } else {
          $field.val("").prop("required", false);
          $q.hide();
        }
      };

      logic();
      $vehType.off("change.maxspeed").on("change.maxspeed", logic);
    }

    function OutsideAgreedValDisplay(mi) {
      const $agreed = $(`#Vehicle_MI${mi}_AgreedVal_NUM`);
      const $market = $(`#Vehicle_MI${mi}_MarketVal_NUM`);
      const $msg = $(
        document.querySelector(`[class*="instanda-multi-item-Vehicle_MI${mi}"]`)
      ).find("#question512072");

      const check = () => {
        const a = parseFloat($agreed.val()?.replace(/,/g, "") || 0);
        const m = parseFloat($market.val()?.replace(/,/g, "") || 0);
        if (a > 0 && m > 0 && a > 1.2 * m) {
          $msg.removeClass("hidden");
        } else {
          $msg.addClass("hidden");
        }
      };
      check();

      $agreed.add($market).on("input", check);
    }

    //Start:BH-26254
    function renderHybElecVeh(mi) {
      console.log("renderHybElecVeh called for mi:", mi);
      const stateRaw = Instanda.Variables.PremiumState_CHOICE;
      const effRaw = Instanda.Variables.EffectiveDate_DATE;

      const $vehType = $(`#Vehicle_MI${mi}_VehType_CHOICEP`);
      const vehTypeRaw = $vehType.val();

      const $hybrid = $(
        `input[name="RegHybridElecVeh_YN__24354__${mi}"]`
      ).closest(".instanda-question-item");

      const stateDates = {
        // Effective 07/15/2023
        Oklahoma: "07/15/2023",
        Maine: "07/15/2023",
        Arizona: "07/15/2023",
        "New Mexico": "07/15/2023",
        Illinois: "07/15/2023",

        // Effective 08/23/2023
        Oregon: "08/23/2023",
        Wyoming: "08/23/2023",
        Wisconsin: "08/23/2023",

        // Effective 09/01/2023
        Ohio: "09/01/2023",

        // Effective 10/01/2023
        Colorado: "10/01/2023",

        // Effective 11/01/2023
        Kentucky: "11/01/2023",
        Missouri: "11/01/2023",
        Utah: "11/01/2023",
        Kansas: "11/01/2023",
        Montana: "11/01/2023",
        Arkansas: "11/01/2023",
        Idaho: "11/01/2023",

        // Added missing states (set to 11/01/2023)
        California: "11/01/2023",
        Delaware: "11/01/2023",
        Florida: "11/01/2023",
        Indiana: "11/01/2023",
        Maryland: "11/01/2023",
        Michigan: "11/01/2023",
        Minnesota: "11/01/2023",
        Nevada: "11/01/2023",
        "New York": "11/01/2023",
        Pennsylvania: "11/01/2023",
        "Rhode Island": "11/01/2023",
        "South Carolina": "11/01/2023",
        Texas: "11/01/2023",
        Virginia: "11/01/2023",
        Vermont: "11/01/2023",
        Washington: "11/01/2023",

        // Effective 12/15/2023
        "New Hampshire": "12/15/2023",
        "District Of Columbia": "12/15/2023",
        Alaska: "12/15/2023",
        Connecticut: "12/15/2023",
      };

      const EXCLUDED_VEHICLE_TYPES = new Set([
        "Collector - Classic",
        "Collector - Antique",
        "Collector - Exotic",
        "Collector - High Value Collectible",
      ]);

      function toTitleCaseState(s) {
        return String(s || "")
          .trim()
          .toLowerCase()
          .replace(/[.,]/g, "")
          .replace(/\s+/g, " ")
          .split(" ")
          .filter(Boolean)
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }

      function canonicalizeStateKey(titleCasedState) {
        // Optional DC handling (covers common variants)
        if (
          titleCasedState === "Dc" ||
          titleCasedState === "D C" ||
          titleCasedState === "Washington Dc" ||
          titleCasedState === "Washington D C"
        ) {
          return "District Of Columbia";
        }
        return titleCasedState;
      }

      function mmddyyyyToNumber(mmddyyyy) {
        const m = String(mmddyyyy || "")
          .trim()
          .match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
        if (!m) return null;
        const [, mm, dd, yyyy] = m;
        return Number(`${yyyy}${mm}${dd}`); // yyyymmdd as number for safe comparison
      }

      function dateLikeToNumber(dateLike) {
        // Accept Date, "MM/DD/YYYY", "MMDDYYYY", or other parseable date strings
        if (dateLike instanceof Date && !Number.isNaN(dateLike.getTime())) {
          const yyyy = dateLike.getUTCFullYear();
          const mm = String(dateLike.getUTCMonth() + 1).padStart(2, "0");
          const dd = String(dateLike.getUTCDate()).padStart(2, "0");
          return Number(`${yyyy}${mm}${dd}`);
        }
        const s = String(dateLike || "").trim();
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return mmddyyyyToNumber(s);
        if (/^\d{8}$/.test(s))
          return Number(`${s.slice(4, 8)}${s.slice(0, 2)}${s.slice(2, 4)}`); // MMDDYYYY -> YYYYMMDD

        const d = new Date(s);
        if (Number.isNaN(d.getTime())) return null;
        const yyyy = d.getUTCFullYear();
        const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(d.getUTCDate()).padStart(2, "0");
        return Number(`${yyyy}${mm}${dd}`);
      }

      //const stateKey = canonicalizeStateKey(toTitleCaseState(stateRaw));
      const thresholdStr = stateDates[stateRaw];
      console.log("thresholdStr:", thresholdStr);
      const thresholdNum = mmddyyyyToNumber(thresholdStr);
      console.log("thresholdNum:", thresholdNum);
      const effNum = dateLikeToNumber(effRaw);
      console.log("thresholdNum:", thresholdNum);

      //const vehTypeNormalized = String(vehTypeRaw || "").trim().toLowerCase();
      const isExcludedVehType = EXCLUDED_VEHICLE_TYPES.has(
        String(vehTypeRaw || "")
      );

      const isEffectiveForState = !!thresholdNum && !!effNum && effNum >= thresholdNum;

      console.log("isEffectiveForState:", isEffectiveForState);
      console.log("isExcludedVehType:", isExcludedVehType);

      const showHybrid = isEffectiveForState && !isExcludedVehType;

      console.log("showHybrid:", showHybrid);

      // Always explicitly toggle (prevents stale UI state)
      $hybrid.toggle(!!showHybrid);
    }
    //End:BH-26254

    function miCollectorTypeRenewal(mi) {
      if (!$(".created-from-renewal").length) return;
      const stateDates = {
        Illinois: "06/01/2025",
        Connecticut: "06/01/2025",
        Missouri: "08/06/2025",
        Oklahoma: "08/06/2025",
        Florida: "08/06/2025",
        Arkansas: "09/15/2025",
        Montana: "09/15/2025",
        Virginia: "09/15/2025",
        Tennessee: "09/15/2025",
        Texas: "12/17/2025",
        Utah: "11/05/2025",
      };
      const state = Instanda.Variables.PremiumState_CHOICE;
      if (!stateDates[state]) return;
      if (
        new Date(formatDateToMMDDYYYY(Instanda.Variables.EffectiveDate_DATE)) <
        new Date(stateDates[state])
      )
        return;

      const modelYear = parseInt($(`#Vehicle_MI${mi}_ModYear_NUM`).val()) || 0;
      const agreedRaw = $(`#Vehicle_MI${mi}_AgreedVal_NUM`).val() || "0";
      const agreed = parseFloat(agreedRaw.replace(/[^0-9.]/g, ""));
      const currentType = $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val();
      const policyYear =
        parseInt(Instanda.Variables.EffectDateYear_TXT) ||
        new Date().getFullYear();
      const age = policyYear - modelYear;

      const setType = (type) => {
        $(`#Vehicle_MI${mi}_VehType_CHOICEP`).val(type).trigger("change");
        $(`#li_Vehicle_MI${mi}_VehType_CHOICEP`).text(type);
      };

      if (
        currentType === "Collector - Classic" &&
        age >= 25 &&
        agreed >= 25000 &&
        agreed <= 124999
      )
        return setType("Collector - Antique");
      if (
        currentType === "Collector - Antique" &&
        age >= 10 &&
        age <= 24 &&
        agreed >= 25000 &&
        agreed <= 124999
      )
        return setType("Collector - Classic");
      if (
        ["Collector - Antique", "Collector - Classic"].includes(currentType) &&
        agreed >= 125000
      )
        return setType("Collector - High Value Collectible");
      if (
        currentType === "Collector - High Value Collectible" &&
        agreed < 125000
      ) {
        return setType(
          age < 25 ? "Collector - Classic" : "Collector - Antique"
        );
      }
    }

    // ====================== MAIN LOOP & OBSERVER ======================
    const runAllExtras = (mi) => {
      VehOwnedLeasedDefMI(mi);
      EffectiveDef(mi);
      CollectorVehMake(mi);
      HideMilesDriven(mi);
      HideDaysWeek(mi);
      HideSnowmobile(mi);
      GaragedAtSecMI(mi);
      HideStoredmasonryMI(mi);
      showExtended(mi);
      ReportedFirstPoten(mi);
      RegisState(mi);
      miVehicleType(mi);
      modelYear(mi);
      miReadonly(mi);
      displayMarketValOverride(mi);
      VehHeightBroker(mi);
      ModelAndBodyStyle(mi);
      MaxOperateSpeed(mi);
      OutsideAgreedValDisplay(mi);
      miCollectorTypeRenewal(mi);
      renderHybElecVeh(mi); //BH-26254
    };

    const process = () => {
      VehOwnedLeasedDefCM(); // global one
      MultiCarCredit(); // global one

      document
        .querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]')
        .forEach((container) => {
          const mi = getMI(container);
          if (mi && !processed.has(mi)) {
            processed.add(mi);
            runAllExtras(mi);
          }
        });
    };

    let timer;
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(process, 100);
    };

    const observer = new MutationObserver((muts) => {
      if (
        muts.some((m) => [...m.addedNodes].some(
          (n) =>
          n.nodeType === 1 &&
          n.matches('[class*="instanda-multi-item-Vehicle_MI"]')
        ))
      ) {
        debounced();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const relevantSuffixes = [
      "_VehType_CHOICEP",
      "_VehUse_CHOICE",
      "_VehMake_CHOICE",
      "_IsVehOwnedOrLeasedMI_CHOICEOwned",
      "_V_EffectiveDate_DATE",
      "_MilesDriven_NUM",
      "_DaysPerWeek_NUM",
      "_GaragingStateMI_TXT",
      "_GaragingPostcodeMI_NUM",
      "_IsVehGaragedMI_YNYes",
      "_IsVehGaragedMI_YNNo",
      "_ModYear_NUM",
      "_AgreedVal_NUM",
      "_MarketVal_NUM",
      "_PrincipalDriver_TXT",
      // ...add as many as your rules depend on
    ];

    // Step 2: Build field selector
    const fieldSelector = relevantSuffixes
      .map((sf) => `[id^="Vehicle_MI"][id$="${sf}"]`)
      .join(",");

    // Step 3: Targeted per-MI logic
    $(document).on("change.extrarules2025", fieldSelector, function (e) {
      const match = this.id.match(/Vehicle_MI(\d+)_/);
      if (match) {
        const mi = parseInt(match[1]);
        runAllExtras(mi);
        processed.add(mi); // re-add, harmless
      }
    });

    // Step 4: Custom template field MI extraction
    $(document).on(
      "change.extrarules2025",
      ".milesdrive input, .daysweek input, .collecmake input",
      function (e) {
        const container = $(this).closest(
          '[class*="instanda-multi-item-Vehicle_MI"]'
        )[0];
        if (container) {
          const mi = getMI(container);
          if (mi) {
            runAllExtras(mi);
            processed.add(mi);
          }
        }
      }
    );

    // Step 5: Keep the fallback/legacy debounce for bulk changes
    $(document).on(
      "click.extrarules2025",
      "#Vehicle_MIaddButton, label[for^='Vehicle_MI'], .vehgar input",
      () => setTimeout(debounced, 300)
    );

    process();
  });

  // Added new perf improvement ended
  // Added the code which is Performance improved

  // =====================================================
  // SCRIPT 3 – VEHICLE SCREEN RULES (Avg Miles, Title Transfers, etc.)
  // Fully optimized – 500+ vehicles = instant
  // Runs completely separate from your Verisk & Extra scripts
  // =====================================================

  $(document).ready(function () {
    if (
      !document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24338"
      )
    )
      return;

    const processed = new Set();

    const getMI = (el) => {
      const match = el.className.match(/instanda-multi-item-Vehicle_MI(\d+)/);
      return match ? parseInt(match[1]) : null;
    };

    // Helper: click "No" on Yes/No radio
    const setNo = (mi, field) => {
      const noLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_${field}No)`
      );
      const isYes = document.getElementById(
        `Vehicle_MI${mi}_ReportFirstPotenDamage_YNYes`
      ).checked;
      if (
        noLabel &&
        !noLabel.classList.contains("instanda-selected") &&
        !isYes
      ) {
        noLabel.click();
      }
    };

    // Helper: click "Yes" on Yes/No radio
    const setYes = (mi, field) => {
      const yesLabel = document.querySelector(
        `label:has(#Vehicle_MI${mi}_${field}Yes)`
      );
      if (yesLabel && !yesLabel.classList.contains("instanda-selected")) {
        yesLabel.click();
      }
    };

    // ====================== MAIN VEHICLE RULES ======================
    const runVehicleScreenRules = (mi) => {
      const $vehType = $(`#Vehicle_MI${mi}_VehType_CHOICEP`);
      const vehType = $vehType.val();
      const $use = $(`#Vehicle_MI${mi}_VehUse_CHOICE`);
      const use = $use.val();
      const state = Instanda.Variables.PremiumState_CHOICE;
      const isNB = $(".created-from-newbusiness").length > 0;
      const isMTA = $(".created-from-mta").length > 0;
      const isRenewal = $(".created-from-renewal").length > 0;
      const isBroker =
        $(".logged-in-broker, .logged-in-internal, .logged-in-external")
        .length > 0;
      const isSuperUser =
        $(
          ".logged-in-ops, .logged-in-opsmanager, .logged-in-uwtech, .logged-in-uw, .logged-in-senioruw, .logged-in-uwmanager"
        ).length > 0;

      // ——— Avg Annual Miles ———
      const $miles = $(`#Vehicle_MI${mi}_AvgAnnualMiles_NUM`);
      if ($miles.length) {
        $miles.off("input.miles").on("input.miles", function () {
          this.value = this.value.replace(/\D/g, "").slice(0, 6);
        });

        const isRegularRated = [
          "Regular",
          "Reg Dune Buggy",
          "Motor Home",
        ].includes(vehType);
        const set9500 =
          isRegularRated &&
          (isMTA ||
            isRenewal || [
              "Alabama",
              "Arizona",
              "Arkansas",
              "Colorado",
              "Connecticut",
              "Florida",
              "Georgia",
              "Idaho",
              "Illinois",
              "Indiana",
              "Kansas",
              "Kentucky",
              "Minnesota",
              "Missouri",
              "Montana",
              "New Hampshire",
              "New Jersey",
              "Ohio",
              "Oklahoma",
              "Oregon",
              "Rhode Island",
              "Tennessee",
              "Texas",
              "Utah",
              "Washington",
              "Wisconsin",
              "Wyoming",
              "South Carolina",
              "Louisiana",
              "Virginia",
              "Maryland",
              "Michigan",
              "New York",
              "California",
            ].includes(state));

        if (set9500 && !$miles.val()) $miles.val("9500");

        if (
          state === "California" &&
          (isRegularRated || ["Business", "To/From Work/School"].includes(use))
        ) {
          $miles.css({
            "pointer-events": "none",
            background: "#eee",
            cursor: "not-allowed",
            color: "#888",
          });
        } else {
          $miles.css({
            "pointer-events": "",
            background: "",
            cursor: "",
            color: "",
          });
        }
      }

      // ——— Reported First Potential Damage ———
      const $reportQ = $(
        `#Vehicle_MI${mi}_ReportFirstPotenDamage_YNYes`
      ).closest(".instanda-question-item");
      if ($reportQ.length) {
        const showReportStates = [
          "Alabama",
          "Arizona",
          "Arkansas",
          "Colorado",
          "Connecticut",
          "Florida",
          "Georgia",
          "Idaho",
          "Illinois",
          "Indiana",
          "Kansas",
          "Kentucky",
          "Minnesota",
          "Missouri",
          "Montana",
          "New Hampshire",
          "New Jersey",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Rhode Island",
          "Tennessee",
          "Texas",
          "Utah",
          "Washington",
          "Wisconsin",
          "Wyoming",
          "South Carolina",
          "California",
        ];
        const isRegular = ["Regular", "Reg Dune Buggy", "Motor Home"].includes(
          vehType
        );

        if (isRegular && showReportStates.includes(state)) {
          $reportQ.show();
          setNo(mi, "ReportFirstPotenDamage_YN");
        } else if (state === "Pennsylvania") {
          if (vehType === "Regular") {
            $reportQ.show();
            setNo(mi, "ReportFirstPotenDamage_YN");
          } else {
            $reportQ.hide();
          }
        } else {
          $reportQ.hide();
        }

        if (isBroker && showReportStates.includes(state)) {
          $reportQ.hide();
        }
      }

      // ——— Verified First Potential Damage ———
      const $verifyQ = $(
        `#Vehicle_MI${mi}_VerifiedFirstPotenDamage_YNYes`
      ).closest(".instanda-question-item");
      if ($verifyQ.length) {
        const showVerifyStates = [
          "Alabama",
          "Arizona",
          "Arkansas",
          "Colorado",
          "Connecticut",
          "Florida",
          "Georgia",
          "Idaho",
          "Illinois",
          "Indiana",
          "Kansas",
          "Kentucky",
          "Minnesota",
          "Missouri",
          "Montana",
          "New Hampshire",
          "New Jersey",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Rhode Island",
          "Tennessee",
          "Texas",
          "Utah",
          "Washington",
          "Wisconsin",
          "Wyoming",
          "South Carolina",
          "California",
        ];
        const isRegular = ["Regular", "Reg Dune Buggy", "Motor Home"].includes(
          vehType
        );

        if (isRegular && showVerifyStates.includes(state)) {
          $verifyQ.show().attr("required", "required");
        } else if (state === "Pennsylvania" && vehType === "Regular") {
          $verifyQ.show().attr("required", "required");
        } else {
          $verifyQ.hide().removeAttr("required");
        }

        if (
          isBroker && [
            "Alabama",
            "Arizona",
            "California",
            "Colorado",
            "Connecticut",
            "Florida",
            "Georgia",
            "Hawaii",
            "Idaho",
            "Illinois",
            "Indiana",
            "Kansas",
            "Kentucky",
            "Louisiana",
            "Minnesota",
            "Missouri",
            "Montana",
            "North Carolina",
            "New Hampshire",
            "Ohio",
            "Oklahoma",
            "Oregon",
            "Pennsylvania",
            "Rhode Island",
            "Tennessee",
            "Texas",
            "Utah",
            "Virginia",
            "Washington",
            "Wisconsin",
            "Wyoming",
          ].includes(state)
        ) {
          $verifyQ.hide();
        }
      }

      // ——— Reported Avg Annual Miles ———
      const $reportedMilesQ = $(
        `#Vehicle_MI${mi}_ReportedAvgAnnualMiles_NUM`
      ).closest(".instanda-question-item");
      if ($reportedMilesQ.length) {
        const hideStates = [
          "Alabama",
          "Arkansas",
          "Arizona",
          "California",
          "Colorado",
          "Connecticut",
          "Florida",
          "Georgia",
          "Hawaii",
          "Idaho",
          "Illinois",
          "Indiana",
          "Kansas",
          "Kentucky",
          "Louisiana",
          "Maryland",
          "Michigan",
          "Minnesota",
          "Missouri",
          "Montana",
          "North Carolina",
          "New Hampshire",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Pennsylvania",
          "Rhode Island",
          "Tennessee",
          "Texas",
          "Utah",
          "Virginia",
          "Washington",
          "Wisconsin",
          "Wyoming",
        ];
        const hideForBroker = isBroker && hideStates.includes(state);
        const hideForNonRegular = ![
          "Regular",
          "Reg Dune Buggy",
          "Motor Home",
        ].includes(vehType);

        if (
          hideForBroker ||
          (hideForNonRegular && hideStates.includes(state))
        ) {
          $reportedMilesQ.hide();
        } else {
          $reportedMilesQ.show();
        }
      }

      // ——— Title Transfers ———
      const $titleNum = $(`#Vehicle_MI${mi}_ReportedNoOfTitleTransfer_NUM`);
      const $titleVerify = $(`#Vehicle_MI${mi}_VerifiefOfTitleTransfer_CHOICE`);
      const $titleNumQ = $titleNum.closest(".instanda-question-item");
      const $titleVerifyQ = $titleVerify.closest(".instanda-question-item");

      if (["Regular", "Reg Dune Buggy", "Motor Home"].includes(vehType)) {
        const titleStates = [
          "Alabama",
          "Arizona",
          "Arkansas",
          "Colorado",
          "Connecticut",
          "Florida",
          "Georgia",
          "Idaho",
          "Illinois",
          "Indiana",
          "Kansas",
          "Kentucky",
          "Minnesota",
          "Missouri",
          "Montana",
          "New Hampshire",
          "New Jersey",
          "Ohio",
          "Oklahoma",
          "Oregon",
          "Rhode Island",
          "Tennessee",
          "Texas",
          "Utah",
          "Washington",
          "Wisconsin",
          "Wyoming",
          "South Carolina",
          "Louisiana",
          "Virginia",
          "California",
        ];
        if (titleStates.includes(state)) {
          $titleNumQ.show();
          $titleVerifyQ.show();
          $titleVerify.attr("required", true);
          if (state !== "California") $titleNum.val("1");
          //$titleNum.attr("required", true);BH-24431 This creates defect as the field is required & readonly

          if (isBroker) {
            $titleNumQ.hide();
            $titleVerifyQ.hide();
          }
        }
      } else {
        $titleNumQ.hide();
        $titleVerifyQ.hide();
        $titleNum.add($titleVerify).removeAttr("required");
      }

      // ——— Market Value → Agreed Value Sync ———
      const $market = $(`#Vehicle_MI${mi}_MarketVal_NUM`);
      const $agreed = $(`#Vehicle_MI${mi}_AgreedVal_NUM`);
      const $original = $(`#Vehicle_MI${mi}_OriginalAgreedVal_NUM`);
      if ($market.val() && !$agreed.val()) {
        $agreed.val($market.val());
        $original.val($market.val()); // Prefill original agreed value as well
        if (
          Instanda.Variables.ConvertedPolicy_YN !== "Yes" &&
          Instanda?.Variables?.SalespersonReferralLevel < 4
        ) {
          //BH-27263
          $market.css({
            "pointer-events": "none",
            background: "#eee",
            cursor: "not-allowed",
          });
          // $('#question481058 input').attr('readonly', true)
          //$('#question481058').removeClass('readonly')
        }
      }
      if ($market.val() !== "") {
        if (
          Instanda.Variables.ConvertedPolicy_YN !== "Yes" &&
          Instanda?.Variables?.SalespersonReferralLevel < 4
        ) {
          //BH-27263
          $market.css({
            "pointer-events": "none",
            background: "#eee",
            cursor: "not-allowed",
          });
          // $('#question481058 input').attr('readonly', true)
          // $('#question481058').removeClass('readonly')
        }
      }

      // Make Market Value editable for internal users in certain states
      if (!isBroker && !isSuperUser) {
        const editableStates = [
          "Florida",
          "Illinois",
          "Arizona",
          "New Jersey",
          "New York",
          "Colorado",
          "Connecticut",
          "Pennsylvania",
          "Maryland",
          "Missouri",
          "Louisiana",
          "Texas",
          "Michigan",
          "Virginia",
          "Tennessee",
          "Iowa",
          "District Of Columbia",
          "Georgia",
          "Kentucky",
          "Oklahoma",
          "Wisconsin",
          "Ohio",
          "Indiana",
          "California",
          "South Carolina",
          "Utah",
          "Washington",
          "Arkansas",
          "Montana",
          "Rhode Island",
          "Oregon",
          "Nevada",
          "Minnesota",
          "Idaho",
          "New Hampshire",
          "Wyoming",
          "Alabama",
        ];
        if (editableStates.includes(state)) {
          if (Instanda.Variables.ConvertedPolicy_YN !== "Yes")
            //BH-27263
            $market.css({
              "pointer-events": "",
              background: "",
              cursor: "",
            });
        }
      }
    };

    // ====================== PROCESS ALL VEHICLES ======================
    const process = () => {
      document
        .querySelectorAll('[class*="instanda-multi-item-Vehicle_MI"]')
        .forEach((container) => {
          const mi = getMI(container);
          if (mi && !processed.has(mi)) {
            processed.add(mi);
            runVehicleScreenRules(mi);

            if (Instanda.Variables.ConvertedPolicy_YN === "Yes")
              removeReadonlyDuringConversion();
          }
        });
    };

    let timer;
    const debounced = () => {
      clearTimeout(timer);
      timer = setTimeout(process, 80);
    };

    const observer = new MutationObserver((muts) => {
      if (
        muts.some((m) => [...m.addedNodes].some(
          (n) =>
          n.nodeType === 1 &&
          n.matches('[class*="instanda-multi-item-Vehicle_MI"]')
        ))
      ) {
        debounced();
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    const relevantSuffixes = [
      "_VehType_CHOICEP",
      "_VehUse_CHOICE",
      "_AvgAnnualMiles_NUM",
      //"_ReportFirstPotenDamage_YNYes", //BH-25932 fix.
      "_ReportFirstPotenDamage_YNNo",
      "_VerifiedFirstPotenDamage_YNYes",
      "_VerifiedFirstPotenDamage_YNNo",
      "_ReportedAvgAnnualMiles_NUM",
      "_ReportedNoOfTitleTransfer_NUM",
      "_VerifiefOfTitleTransfer_CHOICE",
      "_MarketVal_NUM",
      "_AgreedVal_NUM",
      "_ExtendNonOwnVehReg_YNYes",
      "_ExtendNonOwnVehReg_YNNo",
      "_GaragingStateMI_TXT",
      // Add more if needed
    ];

    const fieldSelector = relevantSuffixes
      .map((sf) => `[id^="Vehicle_MI"][id$="${sf}"]`)
      .join(",");

    $(document).on("change.vehiclescreen2025", fieldSelector, function () {
      const match = this.id.match(/Vehicle_MI(\d+)_/);
      if (match) {
        const mi = parseInt(match[1]);
        runVehicleScreenRules(mi);
      } else {
        debounced();
      }
    });

    process();
  });

  // Code ended for Performance improved

  ///////////////////////// Auto - Data Validation Rules (Carfax and NADA) for Vehicle Screen Code End/////////////////////////


  // Auto - Insured Screen - Prior Carrier and UW Company
  // Auto - Combined Logic for Page 1, UW Company, and Other Features - Optimized completely

  $(document).ready(function () {
    console.log("--- Initializing form logic ---");

    // 1. CONSOLIDATED PAGE SELECTORS
    const pageSelector = ".page-quickquotequestions.package-24338";
    const isUWCompanyPage = $(`${pageSelector}.page-number-1`).length > 0;
    const isPageNumber1 =
      $(".page-quickquotequestions.page-number-1").length > 0;
    const isRenewalPage =
      $(`${pageSelector}.created-from-renewal.page-number-1`).length > 0;
    const isPageNumber3 = $(".package-24338.page-number-4").length > 0;

    if (
      !isUWCompanyPage &&
      !isPageNumber1 &&
      !isRenewalPage &&
      !isPageNumber3
    ) {
      console.log("No relevant pages found, exiting initialization");
      return;
    }

    // Cache DOM elements (ONLY fields NOT related to prior carrier)
    var elements = {
      premiumState: $("#PremiumState_CHOICE"),
      uwCompany: $("#UWCompany_CHOICE"),
      prefillFields: [
        "#PrefillFirstName_TXT",
        "#PrefillLastName_TXT",
        "#PrefillMiddleName_TXT",
        "#PrefillDOB_DATE",
        "#PrefillAddressLine1_TXT",
        "#PrefillState_CHOICE",
      ],
    };

    // Utility functions (prior carrier logic removed)
    var getValueFromValueElement = ($element) =>
      $element.length ? $element.val() : "";

    // UW Company logic
    var updateUWCompany = () => {
      if (!isUWCompanyPage) return;
      if (!elements.premiumState.length || !elements.uwCompany.length) {
        console.warn("updateUWCompany: Missing premiumState or uwCompany");
        return;
      }
      var riskRatingState = getValueFromValueElement(elements.premiumState);
      console.log("updateUWCompany: riskRatingState =", riskRatingState);
      const company =
        riskRatingState === "Hawaii" ?
        "The Insurance Company of the State of Pennsylvania" :
        "AIG Property Casualty Company";
      elements.uwCompany.val(company);
      if (!getValueFromValueElement(elements.uwCompany)) {
        console.warn("updateUWCompany: Failed to set UWCompany to", company);
      }
    };

    // Premium state auto-set logic
    function updatePremiumState() {
      var premiumStateEmpty = !getValueFromValueElement(elements.premiumState);

      if (premiumStateEmpty) {
        var maState = $("#RiskStateRO_TXT").val();
        // Add the special condition for "District Of Columbia"
        if (maState && maState === "DC") {
          elements.premiumState.val("District Of Columbia").trigger("change");
        } else if (maState) {
          elements.premiumState.val(getStateName(maState)).trigger("change");
        }
      }
    }

    $("#RiskStateRO_TXT").on("change", updatePremiumState);
    updatePremiumState();

    // Initialization for rules (prior carrier removed)
    function initializeAllRules() {
      const premiumStateVal = getValueFromValueElement(elements.premiumState);

      // If options or values not ready, defer and retry
      if (!premiumStateVal) {
        setTimeout(initializeAllRules, 200);
        return;
      }

      updateUWCompany();
      // hideOrShowFieldsStatewise(premiumStateVal);
      loadDefaultValues(premiumStateVal);
      // hideOrShowFieldsStatewise(premiumStateVal);
    }

    // High Profile Fields (unchanged, removes only prior-carrier specific logic)
    if (isUWCompanyPage && document.querySelector(pageSelector)) {
      if (typeof highProfileAdd === "function") {
        document
          .querySelectorAll(".Highprofile input")
          .forEach(function (selectElement) {
            highProfileAdd({
              target: selectElement,
            });
          });
        document.removeEventListener("change", highProfileAdd);
        document.addEventListener("change", highProfileAdd);
      } else {
        console.warn("highProfileAdd function not found.");
      }
    }

    // Broker Questions List Reordering
    if (isPageNumber1) {
      $(".instanda-questionList:nth-of-type(1)").appendTo(
        ".instanda-questionList:nth-of-type(2)"
      );
    }

    // Renewal Page Logic
    if (isRenewalPage) {
      const appendIfLastChildEmpty = (selector) => {
        const elem = $(selector);
        const parent = elem.parent();
        const lastChildText = parent.children().last().text().trim();
        if (!lastChildText) parent.append(elem.val());
      };
      appendIfLastChildEmpty("#Broker_Country_CHOICE");
      appendIfLastChildEmpty("#MA_Country_CHOICE");
    }

    // Auto Multi Items and Occ Drivers
    if (typeof autoMultiItems === "function") autoMultiItems();
    if (isPageNumber3 && typeof handleOccDrivers === "function")
      handleOccDrivers();

    // Auto Prefill Clear
    if (isUWCompanyPage) {
      $(elements.prefillFields.join(","))
        .off("change.autoPrefill")
        .on("change.autoPrefill", function () {
          // Do your auto prefill reset logic here if needed
        });
    }

    // Run rules
    if (isUWCompanyPage) {
      updateUWCompany();
      updatePremiumState();
      $("#question500547 input, #RiskStateRO_TXT")
        .off("change.premiumState")
        .on("change.premiumState", updatePremiumState);
    }

    function arePremiumStateOptionsReady() {
      // Assumption: at least 2 options means "real options" loaded
      return elements.premiumState.find("option").length > 1;
    }

    function waitForOptionsReady() {
      const premiumStateReady = arePremiumStateOptionsReady();
      if (premiumStateReady) {
        initializeAllRules();
        console.log("initializeAllRules: Key options ready!");
      } else {
        setTimeout(waitForOptionsReady, 300); // Try again every 300ms
      }
    }
    waitForOptionsReady();
  });

  function hideAllPriorCarrierQns() {
    if (
      $("#PremiumState_CHOICE").val() === "" ||
      $("#PriorCarrierValue").val() === "No Prior Insurance"
    ) {
      console.log("All Prior carrier fields are hidden");
      $(".prior-carrier").hide();
      $(".prior-carrier input, .prior-carrier select")
        .attr("required", false)
        .val("")
        .trigger("change");
      $(".otherCar").hide();
      $(".otherCar input").attr("required", false).val("");
      return true;
    } else {
      $(".prior-carrier").show();
      priorCarrierFields();
    }
    return false;
  }

  function priorCarrierFields() {
    console.log("priorCarrierFields function called");
    var premStateValue = $("#PremiumState_CHOICE").val();
    /*if (premStateValue === "") {
      console.log('All Prior carrier fields are hidden');
      $('.prior-carrier').css('display', 'none');
      $('.prior-carrier input, .prior-carrier select').attr('required', false).val('').trigger("change");
    }*/

    //Prior Carrier Value Condtions
    function updateBasedOnPriorCarrierValue() {
      if ($("#PriorCarrierValue").val() === "No Prior Insurance") {
        $(".prior-carrier").hide();
        $(".prior-carrier input").val("");
        $(".prior-carrier select").val("").trigger("change");
      } else if ($("#PriorCarrierValue").val() === "Other") {
        console.log("Show Other Prior carrier");
        $(".otherCar").show();
        $(".otherCar input").attr("required", true);
      } else {
        console.log("Hide Other Prior carrier and reset value");
        $(".otherCar").hide();
        $(".otherCar input").attr("required", false).val("");
      }
    }
    updateBasedOnPriorCarrierValue();
    $("#PriorCarrierValue").on("change", function () {
      updateBasedOnPriorCarrierValue();
    });

    //Prior Carrier Tenure Conditions
    const premiumStatesTenure = [
      "Alabama",
      "Arkansas",
      "Arizona",
      "Colorado",
      "Connecticut",
      "Florida",
      "Georgia",
      "Iowa",
      "Idaho",
      "Illinois",
      "Indiana",
      "Kentucky",
      "Louisiana",
      "Maryland",
      "Michigan",
      "Minnesota",
      "Missouri",
      "Montana",
      "New Hampshire",
      "New Jersey",
      "Nevada",
      "Ohio",
      "Oklahoma",
      "Oregon",
      "Pennsylvania",
      "Rhode Island",
      "South Carolina",
      "Tennessee",
      "Texas",
      "Utah",
      "Virginia",
      "Wisconsin",
      "Wyoming",
    ];
    const moreThanFiveAllowed = ["Texas"];
    const excludeLessThanOneDefault = [
      "Texas",
      "Pennsylvania",
      "Florida",
      "South Carolina",
    ];

    function handleTenureField(premStateValue) {
      let tenureField = $(".prior-carrier.tenure select");
      let tenureValue = tenureField.val(); // Gets the current value
      // Show/hide the entire field based on premiumStates
      if (premiumStatesTenure.includes(premStateValue)) {
        console.log("show prior carrier tenure field");
        $(".prior-carrier.tenure").show();
        $("#PriorCarrierTenureValue").attr("required", true);

        // Hide "More than 5 years" if not TX
        if (moreThanFiveAllowed.includes(premStateValue)) {
          console.log("show more than 5 years");
          tenureField.find('option[value="More than 5 years"]').show();
        } else {
          console.log("Hide more than 5 years");
          tenureField.find('option[value="More than 5 years"]').hide();
          // If currently selected, reset
          if (tenureValue === "More than 5 years") {
            tenureField.val("").trigger("change");
          }
        }

        // Handle defaulting logic when field is blank
        if (!tenureValue) {
          if (premStateValue === "Texas") {
            console.log("Set prior carrier tenure default for TX");
            tenureField.val("More than 4 years").trigger("change");
          } else if (!excludeLessThanOneDefault.includes(premStateValue)) {
            console.log("Set prior carrier tenure default for other states");
            tenureField.val("Less than 1 year").trigger("change");
          }
        }
      } else {
        $(".prior-carrier.tenure").hide();
        console.log("Hide prior carrier tenure");
        $("#PriorCarrierTenureValue").attr("required", false);
        tenureField.val("").trigger("change");
      }
    }
    handleTenureField($("#PremiumState_CHOICE").val());

    //Prior Liability Limit Conditions
    // Mapping of liability limit options to their respective applicable states
    const liabilityLimitOptions = {
      "$10,000/$10,000": ["NY", "NJ"],
      "$10,000/$20,000": ["FL"],
      "$15,000/$30,000": ["AZ", "FL", "LA", "NV", "NY", "PA", "SC", "MS", "NJ"],
      "$20,000/$40,000": [
        "AZ",
        "FL",
        "IA",
        "IL",
        "LA",
        "MD",
        "NV",
        "NY",
        "SC",
        "MS",
        "WV",
        "NJ",
        "PA",
        "HI",
        "MI",
      ],
      "$25,000/$50,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "WV",
        "NJ",
        "PA",
        "DE",
        "MI",
        "ND",
      ],
      "$25,000/$65,000": ["UT"],
      "$30,000/$60,000": ["MD", "TX", "MN", "NC"],
      "$35,000/$35,000": ["PA"],
      "$35,000/$70,000": ["HI"],
      "$50,000/$50,000": ["NY", "HI"],
      "$50,000/$100,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "PA",
        "HI",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$100,000/$100,000": [
        "HI",
        "NC",
        "DC",
        "NV",
        "NE",
        "ND",
        "AR",
        "GA",
        "IL",
        "IN",
        "KS",
        "ME",
        "NM",
        "NY",
        "OK",
        "TX",
        "VT",
        "WA",
        "WI",
        "WY",
        "DE",
        "AK",
        "WV",
      ],
      "$100,000/$200,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$100,000/$300,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "PA",
        "HI",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$100,000/$500,000": ["VA"],
      "$300,000/$300,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "PA",
        "HI",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$250,000/$500,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "PA",
        "HI",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$500,00/$100,000": ["OH"],
      "$500,000/$500,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "WY",
        "MS",
        "NE",
        "AK",
        "WV",
        "NJ",
        "PA",
        "HI",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$500,000/$1,000,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "HI",
        "IA",
        "ID",
        "IN",
        "KS",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "PA",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WY",
        "MS",
        "NE",
        "NC",
        "AK",
        "WV",
        "NJ",
        "MN",
        "MI",
        "ND",
        "WI",
      ],
      "$1,000,000/$1,000,000": [
        "DC",
        "NV",
        "NE",
        "NC",
        "ND",
        "AR",
        "GA",
        "IL",
        "IN",
        "KS",
        "ME",
        "NM",
        "NY",
        "OK",
        "TX",
        "VT",
        "WA",
        "WI",
        "WY",
        "DE",
        "AK",
        "WV",
      ],
      "$1,000,000/$2,000,000": ["NC"],
      "$2,000,000/$2,000,000": ["AK"],
      "$30,000": ["FL", "LA"],
      "$35,000": ["FL", "PA"],
      "$40,000": ["AZ", "NV", "DE"],
      "$50,000": ["AZ", "CT", "FL", "NV", "PA", "DE", "MI"],
      "$55,000": ["IA"],
      "$60,000": ["DC", "IN", "KY", "MO", "NM", "NY", "TN", "VT", "WA", "WI"],
      "$65,000": ["CO", "ID"],
      "$70,000": ["MT", "OR", "MN"],
      "$75,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "MO",
        "MT",
        "NM",
        "NV",
        "OH",
        "OK",
        "OR",
        "RI",
        "SD",
        "TN",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$80,000": ["UT"],
      "$85,000": ["TX"],
      "$100,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "NH",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$115,000": ["WI"],
      "$125,000": ["ME", "AK"],
      "$200,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SD",
        "TN",
        "TX",
        "UT",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "AK",
        "NH",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$300,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "AK",
        "NH",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$325,000": ["TX"],
      "$500,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OH",
        "OK",
        "OR",
        "RI",
        "SC",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "AK",
        "NH",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      "$1,000,000": [
        "AL",
        "AR",
        "AZ",
        "CO",
        "CT",
        "DC",
        "FL",
        "GA",
        "IA",
        "ID",
        "IL",
        "IN",
        "KY",
        "LA",
        "MD",
        "ME",
        "MO",
        "MT",
        "NM",
        "NV",
        "NY",
        "OK",
        "OR",
        "RI",
        "SD",
        "TN",
        "TX",
        "UT",
        "VA",
        "VT",
        "WA",
        "WI",
        "MS",
        "NE",
        "AK",
        "NH",
        "PA",
        "DE",
        "MN",
        "MI",
        "ND",
      ],
      Other: ["ALL"],
    };

    function handleLiabilityLimitField(premStateValue) {
      const state = getStateCode(premStateValue);

      // Hide the entire field for CA
      if (state === "CA") {
        console.log("Hide Prior liability limit for CA");
        $(".prior-carrier.liability-limit").hide();
        $(".prior-carrier.liability-limit select")
          .attr("required", false)
          .val("")
          .trigger("change");
        return;
      }

      // Show the field otherwise
      if (state != "" && state != null) {
        $(".prior-carrier.liability-limit").show();
        console.log("show Prior liability limit", state);
        $(".prior-carrier.liability-limit select").attr("required", true);
        const select = $(".prior-carrier.liability-limit select");
        let val = select.val();

        // Iterate over each option, show/hide based on mapping to state
        select.find("option").each(function () {
          const optionVal = $(this).val();
          const allowedStates = liabilityLimitOptions[optionVal] || [];
          const isAllowed =
            allowedStates.includes("ALL") || allowedStates.includes(state);
          if (isAllowed) {
            $(this).show();
          } else {
            $(this).hide();
            // If currently selected and not allowed, clear it
            if (val === optionVal) {
              val = ""; // reset for validation below
              select.val("");
            }
          }
        });

        // Always ensure "Other" is visible
        select.find('option[value="Other"]').show();

        // Trigger change in case the value changed
        select.trigger("change");
      }
    }
    handleLiabilityLimitField(premStateValue);

    //Other Prior Liability limit Conditions
    function handleOtherLiabilityLimitField(premStateValue) {
      const state = getStateCode(premStateValue); // expects full state name as input
      const limitValue = $(".prior-carrier.liability-limit select").val();

      // Always hidden for TX, CA, TN
      if (state === "TX" || state === "CA" || state === "TN") {
        console.log("Hide other liability limit for 3 states");
        $(".prior-carrier.otherLiabilityLimit").hide();
        $(".prior-carrier.otherLiabilityLimit select")
          .attr("required", false)
          .val("")
          .trigger("change");
        return;
      }

      // Show only if "Other" is selected in liability limit
      if (limitValue === "Other") {
        console.log("show other liability limit");
        $(".prior-carrier.otherLiabilityLimit").show();
        $(".prior-carrier.otherLiabilityLimit select").attr("required", true);
      } else {
        console.log("Hide other liability limit");
        $(".prior-carrier.otherLiabilityLimit").hide();
        $(".prior-carrier.otherLiabilityLimit select")
          .attr("required", false)
          .val("")
          .trigger("change");
      }
    }
    handleOtherLiabilityLimitField(premStateValue);
    $("#PriorLiabilityLimitValue").on("change", function () {
      handleOtherLiabilityLimitField($("#PremiumState_CHOICE").val());
    });

    //Prior Carrier Premium Conditions
    if (
      premStateValue === "Arizona" ||
      premStateValue === "Iowa" ||
      premStateValue === "Maine" ||
      premStateValue === "New Mexico" ||
      premStateValue === "Ohio" ||
      premStateValue === "Tennessee" ||
      premStateValue === "Texas" ||
      premStateValue === "Vermont" ||
      premStateValue === "Virginia" ||
      premStateValue === "West Virginia"
    ) {
      console.log("Show Prior carrier Premium");
      $(".prior-carrier.premium").show();
    } else {
      console.log("Hide Prior carrier Premium and reset value");
      $(".prior-carrier.premium").hide();
      $(".prior-carrier.premium input").val("");
    }
    // Prior Carrier Risk Type
    if (
      $("#PriorCarrierRiskType_TXT").val() === "" &&
      $("#PriorCarrierValue").val() !== "No Prior Insurance"
    ) {
      $("#PriorCarrierRiskType_TXT").val("STANDARD").trigger("change");
    }
  }

  $(document).ready(function () {
    if ($(".page-quickquotequestions.package-24338.page-number-1").length > 0) {
      // priorCarrierFields();
      hideAllPriorCarrierQns();
      $("#PremiumState_CHOICE").on("change", function () {
        console.log(
          "---------------Called on Change of Premium State-------------------"
        );
        // priorCarrierFields();
        hideAllPriorCarrierQns();
      });
      $("#PriorCarrierValue").on("change", function () {
        console.log(
          "---------------Called on Change of Prior Carrier Value-------------------"
        );
        // priorCarrierFields();
        hideAllPriorCarrierQns();
      });
    }
  });
  // End of Prio carrier

  //Function to make Rate Effective date editable if Coverted Policy is Yes for UW and Ops (For AUTO & EL)
  $(document).ready(function () {
    function RateAndIncepConditions() {
      if (
        $(".page-quickquotequestions.page-number-1.package-24338").length > 0 ||
        $(".page-quickquotequestions.page-number-1.package-24428").length > 0
      ) {
        const ConvPolicyYes = [
          $(`label:has(#ConvertedPolicy_YNPYes)`),
          $(`label:has(#ConvertedPolicy_YNYes)`),
        ].find((sel) => sel.length);
        console.log(ConvPolicyYes);
        const reffID = Instanda.Variables.SalespersonReferralLevel;
        if (reffID >= 4 && ConvPolicyYes.hasClass("instanda-selected")) {
          $("#RateEffectiveDate_Date").attr("readonly", false); //Making Rate Effective Date Editable
        } else {
          $("#RateEffectiveDate_Date").attr("readonly", true); ////Making Rate Effective Date Read Only
        }
      }
    }
    RateAndIncepConditions();
    $(document).on(
      "change",
      "label:has(#ConvertedPolicy_YNYes), label:has(#ConvertedPolicy_YNPYes),label:has(#ConvertedPolicy_YNNo), label:has(#ConvertedPolicy_YNPNo)",
      function () {
        RateAndIncepConditions();
      }
    );
  });

  //End of Insured screen for Prior Carrier Field

  //Insured screen for AIG Life Field
  // List of states for which AIG Life should be visible
  var visibleStates = [
    "New Jersey",
    "Virginia",
    "Colorado",
    "Connecticut",
    "Pennsylvania",
    "Illinois",
    "Maryland",
    "Missouri",
    "Louisiana",
    "Texas",
    "Arizona",
    "Michigan",
    "District Of Columbia",
    "Tennessee",
    "Iowa",
    "New York",
    "Florida",
    "Georgia",
    "Kentucky",
    "Oklahoma",
    "Wisconsin",
    "Ohio",
    "Indiana",
    "South Carolina",
    "Utah",
    "Washington",
    "Arkansas",
    "Montana",
    "Rhode Island",
    "Oregon",
    "Idaho",
    "New Hampshire",
    "Wyoming",
    "Alabama",
  ];

  // Function to toggle AIG Life field visibility
  function toggleAIGLifeField() {
    var selectedState = $("#PremiumState_CHOICE").val();
    if (visibleStates.includes(selectedState)) {
      $(".aigLifeOpt").show();
      $(".aigLifeOpt select").attr("required", true);
      // Set the default value to 'None'
      // $('.aigLifeOpt select').val('None');
      $("#AIGLife_CHOICEP").val("None").trigger("change");
    } else {
      $(".aigLifeOpt").hide();
      $(".aigLifeOpt select").removeAttr("required");
      $(".aigLifeOpt select").val(" ");
    }
  }

  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-1.package-24338").length > 0) {
      // Initial check on page load
      if ($("#AIGLife_CHOICEP").val() === "") {
        toggleAIGLifeField();
      }

      // Check whenever the premium state changes
      $("#PremiumState_CHOICE").on("change", toggleAIGLifeField);
    }
  });
  //End of Insured screen for AIG Life Field

  //Auto
  // Hide the decline rule message on copy requoted policies
  if ($('.page-quickquotequestions.page-number-1.package-24338').length > 0) {
    $(document).ready(function () {
      const target = 'Vehicles without comprehensive and collision coverage is not permitted';
      document
        .querySelectorAll('.validation-summary-errors li')
        .forEach(li => {
          if (li.textContent.trim() === target) li.remove();
        });
      // Optional: if that was the only item, remove the empty container
      const ul = document.querySelector('.validation-summary-errors ul');
      if (ul && ul.children.length === 0) {
        const alert = ul.closest('[role="alert"]') || ul.closest('.alert');
        if (alert) alert.remove();
      }
    });
  }

  //Additional Named Insured Insured Screen
  if (
    $(".page-quickquotequestions.page-number-1.package-24338").length > 0 ||
    $(".page-quickquotequestions.page-number-1.package-24428").length > 0
  ) {
    function updateAdditionalInsuredFields() {
      var parentContainerAddIns = document.querySelectorAll(
        '[class*="instanda-multi-item-AdditionalNameInsured_MI"]'
      );
      var prefixAddIns = "instanda-multi-item-AdditionalNameInsured_MI";

      function extractMINumber(parent, prefix) {
        const classList = parent.className.split(" ");
        const matchingClass = classList.find((cls) => cls.includes(prefix));
        if (matchingClass) {
          const match = matchingClass.match(/MI(\d+)/);
          return match ? match[1] : null;
        }
        return null;
      }

      function updateFullName(mi) {
        const typeField = $(
          `#AdditionalNameInsured_MI${mi}_AdditionalNamedType_CHOICEP`
        );
        const fullNameField = $(
          `#AdditionalNameInsured_MI${mi}_AdditionalName_TXT`
        );
        if (typeField.val() === "Individual") {
          const firstName =
            $(`#AdditionalNameInsured_MI${mi}_AddInsuredFirstName_TXT`).val() ||
            "";
          const lastName =
            $(`#AdditionalNameInsured_MI${mi}_AddInsuredLastName_TXT`).val() ||
            "";
          if (fullNameField.length) {
            fullNameField.val(`${firstName} ${lastName}`.trim());
            fullNameField.prop("readonly", false);
            fullNameField.trigger("change");
          }
        } else {
          if (fullNameField.length) {
            fullNameField.prop("readonly", false);
          }
        }
      }
      parentContainerAddIns.forEach((parent) => {
        const addInsMI = extractMINumber(parent, prefixAddIns);
        if (addInsMI) {
          updateFullName(addInsMI);
          $(`#AdditionalNameInsured_MI${addInsMI}_AddInsuredFirstName_TXT`).on(
            "input",
            function () {
              updateFullName(addInsMI);
            }
          );
          $(`#AdditionalNameInsured_MI${addInsMI}_AddInsuredLastName_TXT`).on(
            "input",
            function () {
              updateFullName(addInsMI);
            }
          );
          $(
            `#AdditionalNameInsured_MI${addInsMI}_AdditionalNamedType_CHOICEP`
          ).on("change", function () {
            updateFullName(addInsMI);
          });
        }
      });
    }
    $("#AdditionalNameInsured_MIaddButton").on("click", function () {
      setTimeout(updateAdditionalInsuredFields, 100);
    });
  }
  //End of Additional Named Insured Insured Screen Auto
  // End of Auto Page 1 ////

  // Auto - Premium screen - to mark Quote Adjustment ques required
  $(document).ready(function () {
    if ($(".page-prequotequestions.package-24338").length > 0) {
      var Salesreferlevel = Instanda.Variables.SalespersonReferralLevel;
      // To check if SalespersonReferralLevel is 4 or greater
      if (Salesreferlevel >= 4) {
        $("#TierOverride_YNP").attr("required", "required");
      }
    }
  });
  /// End of Quote Adjustment questions///////

  ////////////////////////// Clear Policy Coverage Fields that are hidden //////////////////////////
  if ($(".page-quickquotequestions.page-number-6.package-24338").length > 0) {
    $('button[name="continueButton"]').on("click", function (e) {
      const ids = [
        "#question483587",
        "#question482456",
        "#question483594",
        "#question483601",
        "#question483066",
        "#question483960",
        "#question483958",
        "#question483971",
        "#question483974",
        "#question483976",
        "#question483135",
      ];
      ids.forEach(function (selector) {
        if ($(selector).length > 0 && $(selector).css("display") === "none") {
          $(selector)
            .find(".instanda-question-hierarchy:nth-child(2)")
            .find("select")
            .val("");
        }
      });
    });
  }
  ////////////////////////// Clear Policy Coverage Fields that are hidden CODE END //////////////////////////

  ////////////// Vehicle Assignment code starts here ////////////////

  function getVehiclesFromMultiItemForDropdown() {
    const getMiNumber = (id = "") => {
      const m = String(id).match(/Vehicle_MI(\d+)_/);
      return m ? Number(m[1]) : null;
    };

    const readValue = (el) => {
      if (!el) return "";
      if ("value" in el && typeof el.value === "string") return el.value.trim();
      const t = el.getAttribute?.("title");
      if (t && t.trim()) return t.trim();
      return (el.textContent || "").trim();
    };

    const pickFirstByMi = (selector, miNumber) => {
      const nodes = Array.from(document.querySelectorAll(selector));
      return nodes.find((el) => getMiNumber(el.id) === miNumber) || null;
    };

    const valueForMi = (miNumber, editableSelector, summarySelector) => {
      // Prefer editable (input/select). If empty, use summary (span/li_)
      const editableEl = pickFirstByMi(editableSelector, miNumber);
      const editableVal = readValue(editableEl);
      if (editableVal) return editableVal;

      const summaryEl = pickFirstByMi(summarySelector, miNumber);
      return readValue(summaryEl);
    };

    // Collect MI numbers from either place (but output only one row per MI)
    const allIds = Array.from(
      document.querySelectorAll('[id*="Vehicle_MI"][id$="_Vin_TXT"]')
    );
    const miNumbers = Array.from(
      new Set(allIds.map((el) => getMiNumber(el.id)).filter((n) => n != null))
    ).sort((a, b) => a - b);

    const vehicles = miNumbers
      .map((miNumber) => {
        const vin = valueForMi(
          miNumber,
          'input[id*="Vehicle_MI"][id$="_Vin_TXT"]',
          'span[id*="Vehicle_MI"][id$="_Vin_TXT"]'
        );
        const year = valueForMi(
          miNumber,
          'input[id*="Vehicle_MI"][id$="_ModYear_NUM"]',
          'span[id*="Vehicle_MI"][id$="_ModYear_NUM"]'
        );
        const make = valueForMi(
          miNumber,
          'select[id*="Vehicle_MI"][id$="_VehMake_CHOICE"]',
          'span[id*="Vehicle_MI"][id$="_VehMake_CHOICE"]'
        );
        const model = valueForMi(
          miNumber,
          'input[id*="Vehicle_MI"][id$="_Model_TXT"]',
          'span[id*="Vehicle_MI"][id$="_Model_TXT"]'
        );

        return {
          vin,
          year,
          make,
          model,
          miNumber,
        };
      })
      .filter((v) => v.vin && v.year && v.make && v.model);

    return vehicles;
  }

  function formatVehiclesForDropdown(vehicles) {
    return vehicles
      .map(
        (vehicle) =>
        `${vehicle.miNumber}. ${vehicle.vin} ${vehicle.year} ${vehicle.make} ${vehicle.model}`
      )
      .join("\n");
  }

  function prefillVehiclesListForDropdown() {
    const vehicles = getVehiclesFromMultiItemForDropdown();
    const formattedVehicles = formatVehiclesForDropdown(vehicles);
    $("#StoreVehicles_TXT").val(formattedVehicles);
  }

  $(document).on(
    "input change",
    'input[id*="Vehicle_MI"][id$="_Vin_TXT"], input[id*="Vehicle_MI"][id$="_ModYear_NUM"], select[id*="Vehicle_MI"][id$="_VehMake_CHOICE"], input[id*="Vehicle_MI"][id$="_Model_TXT"]',
    function () {
      prefillVehiclesListForDropdown();
    }
  );

  // Initial fill and remove button listener on page load (for page 4)
  if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
    prefillVehiclesListForDropdown();

    // Listen for vehicle remove and refresh
    document
      .querySelectorAll(".instanda-multi-item-remove")
      .forEach((button) => {
        button.addEventListener("click", () => {
          setTimeout(() => {
            prefillVehiclesListForDropdown();
          }, 0);
        });
      });
  }

  // Parse vehicles for dropdown with index property for display
  function getVehiclesFromTextarea() {
    const textareaValue = Instanda.Variables.StoreVehicles_TXT;
    if (textareaValue) {
      const lines = textareaValue.split("\r\n");
      return lines
        .map((line) => {
          // Extract leading index before dot, if present
          const match = line.trim().match(/^(\d+)\.\s*(.*)$/);
          let idx, cleanLine;
          if (match) {
            idx = parseInt(match[1], 10);
            cleanLine = match[2];
          } else {
            idx = undefined; // fallback in case no leading number
            cleanLine = line.trim();
          }
          const parts = cleanLine.split(" ");
          const [vin, year, make, ...rest] = parts;
          const model = rest.join(" ");
          return {
            vin,
            year,
            make,
            model,
            idx,
          };
        })
        .filter((v) => v.idx && v.vin && v.year && v.make && v.model);
    }
    return [];
  }

  function setupDropdownsForVehicleAssignments() {
    // vehicles list contains idx (from text, not line number)
    const vehicles = getVehiclesFromTextarea();
    document
      .querySelectorAll(
        ".prefill-vehicles .instanda-question-input, .instanda-well .prefill-vehicles .instanda-question-input"
      )
      .forEach((row) => {
        const vehicleInput = row.querySelector("input");
        if (vehicleInput) {
          bindInputWithDropdown(
            vehicleInput,
            vehicles,
            (v) => `${v.idx}. ${v.vin} ${v.year} ${v.make} ${v.model}`
          );
        }
      });
  }

  // Initialize dropdowns for vehicle assignment (for page 5)
  if ($(".page-quickquotequestions.page-number-5.package-24338").length > 0) {
    setupDropdownsForVehicleAssignments();
    window.addEventListener(
      "DOMContentLoaded",
      setupDropdownsForVehicleAssignments
    );
  }

  ////////////// Vehicle Assignment code ends here ////////////////

  ////////////////////////////StoreDriverVehAssnmt_TXT start
  function miNumberFromId(id) {
    const m = String(id || "").match(/Driver_MI(\d+)_/);
    return m ? Number(m[1]) : 0;
  }

  /**
   * Keep DOB as a plain string in MM/DD/YYYY (no Date parsing).
   * Accepts:
   *  - "MM/DD/YYYY" (or M/D/YYYY) -> returns "MM/DD/YYYY"
   *  - "MMDDYYYY" -> returns "MM/DD/YYYY"
   *  - anything else -> returns trimmed original
   */
  function normalizeDobMMDDYYYY(raw) {
    const s = String(raw || "").trim();
    if (!s) return "";

    const slash = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (slash) {
      const mm = slash[1];
      const dd = slash[2];
      const yyyy = slash[3];
      return `${mm}/${dd}/${yyyy}`;
    }

    const digits = s.match(/^(\d{2})(\d{2})(\d{4})$/);
    if (digits) return `${digits[1]}/${digits[2]}/${digits[3]}`;

    return s;
  }

  function getDriversFromMultiItemForDropdown() {
    const firstNames = Array.from(
      document.querySelectorAll(
        'input[id*="Driver_MI"][id$="_D_FirstName_TXT"]'
      )
    );
    const middleNames = Array.from(
      document.querySelectorAll(
        'input[id*="Driver_MI"][id$="_D_MiddleName_TXT"]'
      )
    );
    const lastNames = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_D_LastName_TXT"]')
    );
    const dobs = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_D_DOB_DATE"]')
    );
    const licenseNos = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_LicenseNo_TXT"]')
    );
    const driverTypes = Array.from(
      document.querySelectorAll(
        'select[id*="Driver_MI"][id$="_DriverType_CHOICEP"]'
      )
    );

    // Index by MI number to avoid repeated find() calls
    const middleByMi = new Map(
      middleNames.map((el) => [miNumberFromId(el.id), el])
    );
    const lastByMi = new Map(
      lastNames.map((el) => [miNumberFromId(el.id), el])
    );
    const dobByMi = new Map(dobs.map((el) => [miNumberFromId(el.id), el]));
    const licByMi = new Map(
      licenseNos.map((el) => [miNumberFromId(el.id), el])
    );
    const typeByMi = new Map(
      driverTypes.map((el) => [miNumberFromId(el.id), el])
    );

    return firstNames
      .map((input) => {
        const miNumber = miNumberFromId(input.id);

        const middleName = (middleByMi.get(miNumber)?.value || "").trim();
        const lastName = (lastByMi.get(miNumber)?.value || "").trim();

        // Key: keep DOB as plain string MM/DD/YYYY
        const dobRaw = (dobByMi.get(miNumber)?.value || "").trim();
        const dob = normalizeDobMMDDYYYY(dobRaw);

        const licenseNo = (licByMi.get(miNumber)?.value || "").trim();
        const driverType = (typeByMi.get(miNumber)?.value || "").trim();

        return {
          firstName: input.value.trim(),
          middleName,
          lastName,
          dob, // MM/DD/YYYY string only
          licenseNo,
          driverType,
          miNumber,
        };
      })
      .filter((d) => {
        if (["Excluded", "Non-Driver"].includes(d.driverType)) return false;
        return d.firstName && d.lastName && d.dob && d.licenseNo;
      });
  }

  function formatDriversForDropdown(drivers) {
    return drivers
      .map((d) => {
        const name =
          `${d.firstName} ` +
          `${d.middleName ? d.middleName + " " : ""}` +
          `${d.lastName}`;
        return `${d.miNumber}. ${name}  ${d.dob}  ${d.licenseNo}`;
      })
      .join("\n");
  }

  function prefillDriversListForDropdown() {
    const drivers = getDriversFromMultiItemForDropdown();
    const formattedDrivers = formatDriversForDropdown(drivers);
    $("#StoreDriverVehAssnmt_TXT").val(formattedDrivers);
  }

  $(document).ready(function () {
    //if($('.page-quickquotequestions.page-number-2.package-24338').length > 0){
    if (
      $(".page-quickquotequestions.page-number-2.package-24338").length > 0 ||
      $(".page-quickquotequestions.page-number-2.package-24428").length > 0
    ) {
      $(document).on(
        "input",
        'input[id*="Driver_MI"][id$="_D_FirstName_TXT"], input[id*="Driver_MI"][id$="_D_LastName_TXT"], input[id*="Driver_MI"][id$="_D_MiddleName_TXT"], input[id*="Driver_MI"][id$="_D_DOB_DATE"],input[id*="Driver_MI"][id$="_LicenseNo_TXT"],input[id*="Driver_MI"][id$="_DriverType_CHOICEP"]',
        function () {
          prefillDriversListForDropdown();
        }
      );
      prefillDriversListForDropdown();
      //calling the function when driver is removed
      document
        .querySelectorAll(".instanda-multi-item-remove")
        .forEach((button) => {
          button.addEventListener("click", () => {
            setTimeout(() => {
              prefillDriversListForDropdown();
              console.log(
                "the remove button is clicked and prefillDriversListForDropdown function called"
              );
            }, 0);
          });
        });
      //input[id*="Driver_MI"][id$="_DriverType_CHOICEP"]
      $(document).on(
        "change",
        '[id^="Driver_MI"][id$="_DriverType_CHOICEP"]',
        function () {
          prefillDriversListForDropdown();
        }
      );
    }
  });
  /////////////////////////StoreDriverVehAssnmt_TXT end

  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Get the list of Drivers and prefill them on next screens
  function getDriversFromMultiItem() {
    const firstNames = Array.from(
      document.querySelectorAll(
        'input[id*="Driver_MI"][id$="_D_FirstName_TXT"]'
      )
    );
    const lastNames = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_D_LastName_TXT"]')
    );

    return firstNames
      .map((input, index) => {
        const firstName = input.value.trim();
        const lastName = lastNames[index] ? lastNames[index].value.trim() : "";
        return {
          firstName,
          lastName,
        };
      })
      .filter((d) => d.firstName && d.lastName);
  }

  function formatDriversForTextarea(drivers) {
    return drivers
      .map((driver) => `${driver.firstName} ${driver.lastName}`)
      .join("\n");
  }

  function prefillDriversList() {
    const drivers = getDriversFromMultiItem();
    const formattedDrivers = formatDriversForTextarea(drivers);
    $("#StoreDrivers_TXT").val(formattedDrivers);
  }

  //if ($('.page-quickquotequestions.page-number-2.package-24338').length > 0) {
  if (
    $(".page-quickquotequestions.page-number-2.package-24338").length > 0 ||
    $(".page-quickquotequestions.page-number-2.package-24428").length > 0
  ) {
    $(document).on(
      "input",
      'input[id*="Driver_MI"][id$="_D_FirstName_TXT"], input[id*="Driver_MI"][id$="_D_LastName_TXT"]',
      function () {
        prefillDriversList();
      }
    );
    prefillDriversList();
    $(document).on("click", ".instanda-multi-item-remove", function () {
      setTimeout(function () {
        prefillDriversList();
        prefillDriversListForDropdown();
      }, 0);
    });
  }





  //vivek start
  ////////////////////////////StoreDriverVehAssnmt_TXT start
  function getDriversFromMultiItemForDropdownEL() {
    const firstNames = Array.from(
      document.querySelectorAll(
        'input[id*="Driver_MI"][id$="_D_FirstName_TXT"]'
      )
    );
    const lastNames = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_D_LastName_TXT"]')
    );
    const DOB = Array.from(
      document.querySelectorAll('input[id*="Driver_MI"][id$="_D_DOB_DATE"]')
    );

    return firstNames
      .map((input, index) => {
        const firstName = input.value.trim();
        const lastName = lastNames[index] ? lastNames[index].value.trim() : "";
        const dobRaw = DOB[index] ? DOB[index].value.trim() : "";
        const dob = normalizeDobMMDDYYYY(dobRaw); // keep as plain string

        return {
          firstName,
          lastName,
          dob,
        };
      })
      .filter((d) => d.firstName && d.lastName && d.dob);
  }

  function formatDriversForDropdownEL(drivers) {
    return drivers
      .map(
        (driver, index) =>
        `${index + 1}. ${driver.firstName} ${driver.lastName} ${driver.dob}`
      )
      .join("\n");
  }

  function prefillDriversListForDropdownEL() {
    const drivers = getDriversFromMultiItemForDropdownEL();
    const formattedDrivers = formatDriversForDropdownEL(drivers);
    $("#StoreDriverVehAssnmt_TXT").val(formattedDrivers);
  }
  //vivek commented here test
  // if ($('.page-quickquotequestions.page-number-2.package-24428').length > 0) {
  //     $(document).on('input', 'input[id*="Driver_MI"][id$="_D_FirstName_TXT"], input[id*="Driver_MI"][id$="_D_LastName_TXT"], input[id*="Driver_MI"][id$="_D_MiddleName_TXT"],input[id*="Driver_MI"][id$="_D_DOB_DATE"],input[id*="Driver_MI"][id$="_LicenseNo_TXT"],input[id*="Driver_MI"][id$="_DriverType_CHOICEP"]', function () {
  //         prefillDriversListForDropdownEL();
  //     });
  //     prefillDriversListForDropdownEL();
  //     //calling the function when driver is removed
  //     document.querySelectorAll('.instanda-multi-item-remove').forEach(button => {
  //         button.addEventListener('click', () => {
  //             setTimeout(() => {
  //                 prefillDriversListForDropdownEL();
  //                 console.log('the remove button is clicked and prefillDriversListForDropdownEL function called');
  //             }, 0);
  //         });
  //     });
  // }
  /////////////////////////StoreDriverVehAssnmt_TXT end
  //vivek end
  ///////////////////////// Drivers list ended and prefill code starts ///////////////////////
  $(".prefill-drivers input").attr("placeholder", "Please select...");

  function getDriversFromTextarea() {
    const textareaValue = Instanda.Variables.StoreDriverVehAssnmt_TXT;
    if (textareaValue) {
      const names = textareaValue.split("\r\n");

      return names
        .map((name) => {
          const [firstName, ...rest] = name.trim().split(" ");
          const lastName = rest.join(" ");
          return {
            firstName,
            lastName,
          };
        })
        .filter((d) => d.firstName && d.lastName);
    }
  }

  function createDropdown(options, onSelect) {
    const dropdown = document.createElement("div");
    dropdown.id = "dropdown-control";
    dropdown.className = "driverListDropdown";
    dropdown.style.position = "absolute";
    dropdown.style.background = "#fff";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.zIndex = 998;
    dropdown.style.maxHeight = "150px";
    dropdown.style.overflowY = "auto";
    dropdown.style.boxShadow = "0 2px 6px rgba(0,0,0,0.1)";
    dropdown.style.fontSize = "14px";

    // Add default "Please select"
    const defaultItem = document.createElement("div");
    defaultItem.style.padding = "6px";
    defaultItem.style.color = "#555";
    defaultItem.innerText = "Please select...";
    defaultItem.addEventListener("mousedown", (e) => {
      e.preventDefault();
      onSelect({
        label: "",
        value: null,
      });
      dropdown.remove();
    });
    defaultItem.addEventListener(
      "mouseover",
      () => (defaultItem.style.background = "#1967d2")
    );
    defaultItem.addEventListener(
      "mouseout",
      () => (defaultItem.style.background = "#fff")
    );
    dropdown.appendChild(defaultItem);

    // Add other options
    options.forEach((opt) => {
      const item = document.createElement("div");
      item.style.padding = "6px";
      item.style.cursor = "pointer";
      item.innerText = opt.label;
      item.addEventListener("mousedown", (e) => {
        e.preventDefault();
        onSelect(opt);
        dropdown.remove();
      });
      item.addEventListener(
        "mouseover",
        () => (item.style.background = "#1967d2")
      );
      item.addEventListener("mouseout", () => (item.style.background = "#fff"));
      dropdown.appendChild(item);
    });

    document.body.appendChild(dropdown);
    return dropdown;
  }

  function bindInputWithDropdown(inputElement, dataList, getLabel) {
    let dropdown;

    //  inputElement.setAttribute('readonly', true);
    inputElement.placeholder = "Please select...";

    function isValid(value) {
      return dataList.some((item) => getLabel(item) === value.trim());
    }

    function validateInput() {
      if (!isValid(inputElement.value)) {
        inputElement.value = "";
      }
    }

    // Check immediately on load
    //validateInput();

    // Optionally check on input, change, blur, and custom events
    inputElement.addEventListener("input", () => {
      // Clean up the dropdown if user (or script) changes input
      if (dropdown) {
        dropdown.remove();
        dropdown = null;
      }
      validateInput();
    });
    inputElement.addEventListener("change", validateInput);
    inputElement.addEventListener("blur", validateInput);

    // Optionally add a method to re-validate after dataList changes
    inputElement._validateAgainstDataList = validateInput;

    inputElement.addEventListener("focus", () => {
      const rect = inputElement.getBoundingClientRect();
      const options = dataList.map((item) => ({
        label: getLabel(item),
        value: item,
      }));

      if (dropdown) {
        dropdown.remove();
      }

      dropdown = createDropdown(options, (selected) => {
        inputElement.value = selected.label;
        console.log("Principal Driver changed");
        inputElement.dispatchEvent(new Event("change"));
        dropdown.remove();
        dropdown = null;
        inputElement.blur();
      });

      dropdown.style.top = `${window.scrollY + rect.bottom}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;

      // Remove dropdown on blur
      inputElement.addEventListener(
        "blur",
        () => {
          setTimeout(() => {
            if (dropdown) {
              dropdown.remove();
              dropdown = null;
            }
          }, 200);
        }, {
          once: true,
        }
      );
    });
  }

  ////////////Dropdown code with original value starts ///////////////

  function bindWithoutDuplicateDropdown(inputElement, dataList, getLabel) {
    // Store dropdown reference on the input element
    if (inputElement._dropdown && inputElement._dropdown.parentNode) {
      inputElement._dropdown.remove();
      inputElement._dropdown = null;
    }

    inputElement.addEventListener("focus", () => {
      // Remove any existing dropdown before creating a new one
      if (inputElement._dropdown && inputElement._dropdown.parentNode) {
        inputElement._dropdown.remove();
        inputElement._dropdown = null;
      }

      const rect = inputElement.getBoundingClientRect();
      const options = dataList.map((item) => ({
        label: getLabel(item),
        value: item,
      }));

      const dropdown = createDropdown(options, (selected) => {
        inputElement.value = selected.label;
        if (dropdown && dropdown.parentNode) {
          dropdown.remove();
        }
        inputElement._dropdown = null;
        inputElement.blur();
      });
      console.log("Dropdown created for input:", inputElement);
      console.log("Dropdown options:", options);

      dropdown.style.top = `${window.scrollY + rect.bottom}px`;
      dropdown.style.left = `${rect.left}px`;
      dropdown.style.width = `${rect.width}px`;

      // Store reference for future removal
      inputElement._dropdown = dropdown;

      // Auto-remove dropdown on blur
      inputElement.addEventListener(
        "blur",
        () => {
          setTimeout(() => {
            if (inputElement._dropdown && inputElement._dropdown.parentNode) {
              inputElement._dropdown.remove();
              inputElement._dropdown = null;
            }
          }, 200);
        }, {
          once: true,
        }
      );
    });

    inputElement.addEventListener("input", () => {
      if (inputElement._dropdown && inputElement._dropdown.parentNode) {
        inputElement._dropdown.remove();
        inputElement._dropdown = null;
      }
    });
  }

  ////////////Dropdown code with original value ends ///////////////

  function setupDropdownsForAssignments() {
    const drivers = getDriversFromTextarea(); // Use drivers from textarea
    console.log("*******principalInput");
    if ($(".page-quickquotequestions.page-number-3.package-24338").length > 0) {
      document
        .querySelectorAll(".prefill-drivers .instanda-question-input")
        .forEach((row) => {
          const principalInput = row.querySelector("input");

          if (principalInput) {
            // console.log(principalInput);
            bindInputWithDropdown(
              principalInput,
              drivers,
              (d) => `${d.firstName} ${d.lastName}`
            );
          }
        });
    } else {
      document
        .querySelectorAll(
          ".instanda-well .prefill-drivers .instanda-question-input"
        )
        .forEach((row) => {
          const principalInput = row.querySelector("input");

          if (principalInput) {
            //  console.log(principalInput);
            bindInputWithDropdown(
              principalInput,
              drivers,
              (d) => `${d.firstName} ${d.lastName}`
            );
          }
        });
    }
  }

  // Run on load
  setupDropdownsForAssignments();
  window.addEventListener("DOMContentLoaded", setupDropdownsForAssignments);

  // clear drivers if removed from Drivers screen
  function clearRemovedDrivers() {
    const assignedDrivers = document.querySelectorAll(".prefill-drivers input");
    const updatedDriversTxt = Instanda.Variables.StoreDriverVehAssnmt_TXT;
    const updatedDrivers = updatedDriversTxt.split("\n");
    assignedDrivers.forEach((driver) => {
      // const driverRack = driver.value
      const driverParent = driver.closest(
        "div[data-summary-header$='_MI_summary']"
      );
      const driverFLNameEle = driverParent.querySelector(
        "[id*='DriverFLName']"
      );
      const driverFLName = driverFLNameEle.value;
      if (driverFLNameEle) {
        const firstName = driverFLName.split(" ").at(0);
        const lastName = driverFLName.split(" ").at(-1);

        let driverFound = false;
        for (let i = 0; i < updatedDrivers.length; i++) {
          if (
            updatedDrivers[i].includes(firstName) &&
            updatedDrivers[i].includes(lastName)
          ) {
            driverFound = true;
            driver.value = updatedDrivers[i];
          }
        }

        if (!driverFound) {
          driver.value = "";
          driverFLNameEle.value = "";
          driverFLNameEle.dispatchEvent(new Event("change"));
          driverFLNameEle.dispatchEvent(new Event("blur"));
        }
      }
    });
  }

  // clear vehicles if removed from vehicle info screen
  function clearRemovedVehicles() {
    const assignedVehicles = document.querySelectorAll(
      ".prefill-vehicles input"
    );
    const updatedVehiclesTxt = Instanda.Variables.StoreVehicles_TXT;
    const updatedVehicles = updatedVehiclesTxt.split("\n");
    assignedVehicles.forEach((vehicle) => {
      const vehicleRack = vehicle.value;
      if (!updatedVehiclesTxt.includes(vehicleRack) && vehicleRack !== "") {
        const firstSpaceChar = vehicleRack.indexOf(" ");
        const vehicleDetails = vehicleRack.slice(firstSpaceChar + 1);
        if (!updatedVehiclesTxt.includes(vehicleDetails)) {
          vehicle.value = "";
          vehicle.dispatchEvent(new Event("change"));
          vehicle.dispatchEvent(new Event("blur"));
        } else {
          for (let i = 0; i < updatedVehicles.length; i++) {
            if (updatedVehicles[i].includes(vehicleDetails)) {
              vehicle.value = `${i + 1}. ${vehicleDetails}`;
              vehicle.dispatchEvent(new Event("change"));
              vehicle.dispatchEvent(new Event("blur"));
              break;
            }
          }
        }
      }
    });
  }

  $(document).ready(() => {
    if (
      document.querySelector(
        ".page-quickquotequestions.page-number-3.package-24338"
      ) ||
      document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24338"
      ) ||
      document.querySelector(
        ".page-quickquotequestions.page-number-5.package-24338"
      ) ||
      document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24428"
      )
    ) {
      setTimeout(clearRemovedDrivers, 200);
    }

    if (
      document.querySelector(
        ".page-quickquotequestions.page-number-5.package-24338"
      )
    ) {
      setTimeout(clearRemovedVehicles, 200);
    }
  });

  //////////////////////////////////////////// Drivers List Ends //////////////////////////

  /*
  $(document).ready(function() {
      function hideStateSelect() {
      if(Instanda.Variables['PackageId'] == 24338 || Instanda.Variables['PackageId'] == 24428 ){
    $('.hideStateAdvChoice .instanda-question-hierarchy:first-child select').each(function () {
        const advStateselect = $(this);
        if (advStateselect.length > 0) {
            const selectElement = advStateselect[0];
            const currentValue = selectElement.value;
            //const isValueSelected = currentValue !== "" && currentValue !== null;
          if (currentValue !== Instanda.Variables.PremiumState_CHOICE && selectElement.options.length > 0) {
                const optionToSelect = Array.from(selectElement.options).find(
                opt => opt.value === Instanda.Variables.PremiumState_CHOICE
            );
        if (optionToSelect) {
            Array.from(selectElement.options).forEach(opt => opt.removeAttribute('selected'));
            optionToSelect.setAttribute('selected', 'selected');
             selectElement.value = optionToSelect.value;
            selectElement.dispatchEvent(new Event('change'));
         }
         }
         advStateselect.hide();
         }
    });
  }
      }
      hideStateSelect();
      $('[name="continueButton"]').on('click', function() {
          setTimeout(hideStateSelect, 1000); 
      });
    });
  */

  function hideStateSelect() {
    try {
      if (
        Instanda.Variables["PackageId"] == 24338 ||
        Instanda.Variables["PackageId"] == 24428
      ) {
        $(
          ".hideStateAdvChoice .instanda-question-hierarchy:first-child select"
        ).each(function () {
          const advStateselect = $(this);
          if (advStateselect.length > 0) {
            const selectElement = advStateselect[0];
            const currentValue = selectElement.value;
            //const isValueSelected = currentValue !== "" && currentValue !== null;
            if (
              currentValue !== Instanda.Variables.PremiumState_CHOICE &&
              selectElement.options.length > 0
            ) {
              const optionToSelect =
                Array.from(selectElement.options).find(
                  (opt) => opt.value === Instanda.Variables.PremiumState_CHOICE
                ) ||
                Array.from(selectElement.options).find(
                  (opt) => opt.text === "Please select"
                );
              if (optionToSelect) {
                Array.from(selectElement.options).forEach((opt) =>
                  opt.removeAttribute("selected")
                );
                optionToSelect.setAttribute("selected", "selected");
                selectElement.value = optionToSelect.value;
                selectElement.dispatchEvent(new Event("change"));
              }
            }
            //advStateselect.hide();
          }
        });
      }
    } catch (e) {
      console.log(e);
    }
  }

  $(document).ready(function () {
    setTimeout(hideStateSelect, 10);
  });

  //hidePolTypeOpt

  $(document).ready(function () {
    if (
      $(".page-quickquotequestions.page-number-1.package-24338").length > 0 ||
      $(".page-quickquotequestions.page-number-6.package-24338").length > 0
    ) {
      //$("#PolicyTypeCDBodilyInjNJ").val(Instanda.Variables.PolicyType_CHOICE);
      $(".hidePolTypeOpt .instanda-question-hierarchy:first-child select").each(
        function () {
          const polTypeSel = $(this);
          if (polTypeSel.length > 0) {
            const selectElement = polTypeSel[0];
            const currentValue = selectElement.value;
            //const isValueSelected = currentValue !== "" && currentValue !== null;
            if (
              currentValue !== Instanda.Variables.PolicyType_CHOICE &&
              selectElement.options.length > 0
            ) {
              const optionToSelect = Array.from(selectElement.options).find(
                (opt) => opt.value === Instanda.Variables.PolicyType_CHOICE
              );
              if (optionToSelect) {
                Array.from(selectElement.options).forEach((opt) =>
                  opt.removeAttribute("selected")
                );
                optionToSelect.setAttribute("selected", "selected");
                selectElement.value = optionToSelect.value;
                selectElement.dispatchEvent(new Event("change"));
              }
            }
            polTypeSel.hide();
          }
        }
      );
    }
  });

  // Handle Infractions/////

  function handleInfractions() {
    // Only run if target page exists
    if (
      $(".page-quickquotequestions.page-number-2.package-24338").length === 0
    ) {
      console.log("Target page not found, exiting handleInfractions");
      return;
    }

    // summarise infractions
    function summariseInfraction(driver) {
      const infractionQuestionIdMapping = {
        1: {
          Infraction_Type: "question491937",
          Points: "question491942",
          Infraction_Date: "question491941",
        },
        2: {
          Infraction_Type: "question491997",
          Points: "question492001",
          Infraction_Date: "question492000",
        },
        3: {
          Infraction_Type: "question492323",
          Points: "question492329",
          Infraction_Date: "question492328",
        },
        4: {
          Infraction_Type: "question492372",
          Points: "question492376",
          Infraction_Date: "question492375",
        },
        5: {
          Infraction_Type: "question492547",
          Points: "question492958",
          Infraction_Date: "question492586",
        },
        6: {
          Infraction_Type: "question492992",
          Points: "question492999",
          Infraction_Date: "question492998",
        },
        7: {
          Infraction_Type: "question493056",
          Points: "question493065",
          Infraction_Date: "question493064",
        },
        8: {
          Infraction_Type: "question493108",
          Points: "question493117",
          Infraction_Date: "question493116",
        },
        9: {
          Infraction_Type: "question493151",
          Points: "question493157",
          Infraction_Date: "question493156",
        },
        10: {
          Infraction_Type: "question493264",
          Points: "question493269",
          Infraction_Date: "question493268",
        },
        11: {
          Infraction_Type: "question493304",
          Points: "question493309",
          Infraction_Date: "question493308",
        },
        12: {
          Infraction_Type: "question493343",
          Points: "question493348",
          Infraction_Date: "question493347",
        },
        13: {
          Infraction_Type: "question493382",
          Points: "question493387",
          Infraction_Date: "question493386",
        },
        14: {
          Infraction_Type: "question493422",
          Points: "question493429",
          Infraction_Date: "question493428",
        },
        15: {
          Infraction_Type: "question493475",
          Points: "question493480",
          Infraction_Date: "question493479",
        },
        16: {
          Infraction_Type: "question493669",
          Points: "question493687",
          Infraction_Date: "question493682",
        },
        17: {
          Infraction_Type: "question494028",
          Points: "question494035",
          Infraction_Date: "question494034",
        },
        18: {
          Infraction_Type: "question493686",
          Points: "question493698",
          Infraction_Date: "question493696",
        },
        19: {
          Infraction_Type: "question493619",
          Points: "question493640",
          Infraction_Date: "question493639",
        },
        20: {
          Infraction_Type: "question493552",
          Points: "question493558",
          Infraction_Date: "question493557",
        },
      };
      const driverId = driver.id;
      const pattern = driverId.match(/^Driver_MI(\d+)$/);
      const miIndex = pattern[1];
      const infractions = driver.querySelectorAll(
        `.infraction-details:has(.radio-inline.instanda-question-yes-no-parent-yes.instanda-selected)`
      );

      let totalInfractions = 0;
      let totalConvictions = 0;
      let totalAccidents = 0;
      let totalPoints = 0;
      let totalPointsLessthn3yrs = 0;
      let totalPointsLessthn5yrs = 0;
      const infractionMetaArr = [];
      let infractionNumber = 0;

      try {
        for (let infraction of infractions) {
          // if (infraction.querySelector(".radio-inline.instanda-question-yes-no-parent-yes.instanda-selected")) {
          infractionNumber++;
          totalInfractions++;
          // infraction.querySelector("#question491934 input").value = infractionNumber;

          const infractionContent = $(infraction).find(
            "[id^='Infraction'][id*='_Add_YNP__24355__'][id$='_Children']"
          );
          const pattern = $(infractionContent)
            .attr("id")
            .match(/^Infraction(\d+)_Add_YNP__24355__(\d+)_Children$/);
          const infractionIndex = pattern[1];

          const infractionTypeEle = infraction.querySelector(
            `#${infractionQuestionIdMapping[infractionIndex]["Infraction_Type"]} select`
          );
          const infractionType = infractionTypeEle ?
            infractionTypeEle.value :
            false;
          if (infractionType === "Accident") totalAccidents++;
          else if (infractionType === "Conviction") totalConvictions++;

          const pointsEle = infraction.querySelector(
            `#${infractionQuestionIdMapping[infractionIndex]["Points"]} select`
          );
          const points = pointsEle ?
            Number.parseInt(pointsEle.value) ?
            Number.parseInt(pointsEle.value) :
            0 :
            0;
          totalPoints += points;

          const currentDate = new Date();
          const infractionDate = new Date(
            infraction.querySelector(
              `#${infractionQuestionIdMapping[infractionIndex]["Infraction_Date"]} input`
            ).value
          );
          const infractionYears =
            (currentDate - infractionDate) / (1000 * 60 * 60 * 24 * 365);
          if (infractionYears <= 3) totalPointsLessthn3yrs += points;
          if (infractionYears <= 5) totalPointsLessthn5yrs += points;

          const infractionMeta = {
            infractionNumber,
            infractionType,
            points,
            infractionYears,
          };
          infractionMetaArr.push(infractionMeta);
        }
        // Total Accidents
        driver.querySelector("#question486113 input").value = totalAccidents;

        // Total convictions
        driver.querySelector("#question486114 input").value = totalConvictions;

        // Total points
        driver.querySelector("#question486115 input").value = totalPoints;

        // points within 3 years
        driver.querySelector("#question486116 input").value =
          totalPointsLessthn3yrs;

        // points within  5 years
        driver.querySelector("#question486117 input").value =
          totalPointsLessthn5yrs;
      } catch (e) {
        console.log(e);
      }
    }

    // Utility function to extract indices from infraction ID
    const getInfractionIndices = ($element) => {
      const id = $element.attr("id") || "";

      const match = id.match(
        /^Infraction(\d+)_Add_YNP__24355__(\d+)_Children$/
      );
      //console.log($element,"element at getInfrIndx")
      //console.log(match,"match");
      if (!match) {
        console.warn(
          `Invalid infraction ID format: ${id}. Skipping this element.`
        );
        return null;
      }
      return {
        infractionIndex: match[1],
        multiIndex: match[2],
      };
    };

    // Utility function to get driver name
    const getDriverName = (multiIndex) => {
      const $firstName = $(`#li_Driver_MI${multiIndex}_D_FirstName_TXT`);
      const $lastName = $(`#li_Driver_MI${multiIndex}_D_LastName_TXT`);
      const firstName = $firstName.text()?.trim() || "";
      const lastName = $lastName.text()?.trim() || "";
      const driverName = `${firstName} ${lastName}`.trim();
      if (!driverName) {
        console.warn(`Driver name not found for multiIndex: ${multiIndex}`);
      }
      return driverName;
    };

    // Utility function to update infraction summary
    const updateInfractionSummary = ($container) => {
      const $summary = $container.find(".infraction-details-summ");
      if (!$summary.length) {
        console.warn("Summary container (.infraction-details-summ) not found");
        return;
      }

      const $infractionNumber = $container
        .find('label:contains("Infraction Number")')
        .parent()
        .siblings()
        .find("input");
      const $faultIndicator = $container
        .find('label:contains("Fault Indicator")')
        .parent()
        .siblings()
        .find("select");
      const $infractionDate = $container
        .find('label:contains("Violation/Accident Date")')
        .parent()
        .siblings()
        .find("input");
      const $source = $container
        .find('label:contains("Source")')
        .parent()
        .siblings()
        .find("input");

      $summary.find(".infraction-number-summ").html("");
      $summary
        .find(".infraction-fault-summ")
        .html($faultIndicator.val()?.trim() || "");
      $summary
        .find(".infraction-date-summ")
        .html($infractionDate.val()?.trim() || "");
      $summary
        .find(".infraction-source-summ")
        .html($source.val()?.trim() || "");
    };

    // Function to prefill infraction list
    const prefillInfractionList = () => {
      const $infractionDetails = $(".infraction-details");
      if (!$infractionDetails.length) {
        console.log("No .infraction-details elements found");
        return;
      }

      $infractionDetails.each(function () {
        const $container = $(this);
        const $infractionInput = $container
          .find('[id*="Infraction"][id*="_Add_YNP__24355__"][id*="_Children"]')
          .first();
        const indices = getInfractionIndices($infractionInput);
        if (!indices) return; // Skip if indices are invalid

        const {
          multiIndex
        } = indices;
        const driverName = getDriverName(multiIndex);
        if (driverName) {
          $container.find(".inf-driver-name").html(driverName);
        }

        const yesSelected =
          $container.find(
            ".instanda-question-yes-no-parent-yes.instanda-selected"
          ).length > 0;
        if (yesSelected) {
          updateInfractionSummary($container);
        } else {
          $container.appendTo($container.parent());
        }
      });
    };

    // Function to prefill current infraction
    const prefillCurrentInfraction = ($container) => {
      const $infractionInput = $container
        .find('[id*="Infraction"][id*="_Add_YNP__24355__"][id*="_Children"]')
        .first();
      //console.log($infractionInput,"at prefill function")
      const indices = getInfractionIndices($infractionInput);
      if (!indices) return;

      const {
        multiIndex
      } = indices;
      const driverName = getDriverName(multiIndex);
      if (driverName) {
        $container.find(".inf-driver-name").html(driverName);
      }

      const yesSelected =
        $container.find(
          ".instanda-question-yes-no-parent-yes.instanda-selected"
        ).length > 0;
      if (yesSelected) {
        updateInfractionSummary($container);
      }
    };

    // Function to update driver name color based on infraction status
    const cleanRecord = () => {
      console.log("Running cleanRecord");
      const drivers = document.querySelectorAll(
        '[id^="multi-item-summary-Driver_MI"]'
      );
      drivers.forEach((driver) => {
        const match = driver.id.match(/^multi-item-summary-Driver_MI(\d+)$/);
        if (!match) {
          console.error(`Invalid driver ID format: ${driver.id}`);
          return;
        }
        const miIndex = match[1];
        const $question501520 = document.querySelector(
          `#Driver_MI${miIndex} #question501520 .instanda-question-yes-no-yes.instanda-selected`
        );
        if ($question501520) {
          const infractions = document.querySelectorAll(
            `[id^="Infraction"][id$="_Add_YNP__24355__${miIndex}_Children"]`
          );
          let color = "green";
          for (const infraction of infractions) {
            if (infraction.style.display !== "none") {
              color = "red";
              break;
            }
          }
          const $firstName = document.querySelector(
            `#li_Driver_MI${miIndex}_D_FirstName_TXT`
          );
          if ($firstName) {
            $firstName.style.color = color;
          } else {
            console.warn(
              `First name element not found for multiIndex: ${miIndex}`
            );
          }
        }
      });
    };

    // Add hold-for-renewal class to specified questions
    const questionIds = [
      "#question491945",
      "#question492003",
      "#question492331",
      "#question492466",
      "#question492960",
      "#question493002",
      "#question493067",
      "#question493120",
      "#question493161",
      "#question493271",
      "#question493311",
      "#question493350",
      "#question493389",
      "#question493432",
      "#question493482",
      "#question493692",
      "#question494037",
      "#question493702",
      "#question493642",
      "#question493562",
    ];
    $(questionIds.join(",")).addClass("hold-for-renewal");

    // Add inf-side-drawer-container class
    $('.inf-det-list-view > [id*="collapse_Driver_MI"]').addClass(
      "inf-side-drawer-container"
    );

    // Run initial functions
    prefillInfractionList();
    //cleanRecord();

    // Event handlers
    const debouncedPrefillCurrentInfraction = debounce(
      prefillCurrentInfraction,
      100
    );
    const debouncedCleanRecord = debounce(cleanRecord, 100);

    // Handle collapse toggling for driver details
    $(document).on("click", '[id*="heading_Driver_MI"][id*="_491932"]', () => {
      $('[id*="collapse_Driver_MI"][id*="_486112"]').css("display", "none");
      $('[id*="collapse_Driver_MI"][id*="_491932"]').css("display", "flex");
    });

    $(document).on("click", '[id*="heading_Driver_MI"][id*="_486112"]', () => {
      $('[id*="collapse_Driver_MI"][id*="_491932"]').css("display", "none");
      $('[id*="collapse_Driver_MI"][id*="_486112"]').css("display", "flex");
    });

    // Handle driver name clicks
    $(document).on(
      "click",
      '[id*="li_Driver_MI"][id*="_D_FirstName_TXT"]',
      function () {
        const id = this.id;
        const match = id.match(/^li_Driver_MI(\d+)_D_FirstName_TXT$/);
        if (!match) {
          console.error(`Invalid driver ID format: ${id}`);
          return;
        }
        const multiIndex = match[1];
        $(".side-drawer-container").hide();
        $(
          `.instanda-multi-item-Driver_MI${multiIndex} .side-drawer-container`
        ).show();
        $("#question493260 a").removeAttr("onclick");
        $('[id*="collapse_Driver_MI"][id*="_486112"]').css("display", "flex");
        $('[id*="collapse_Driver_MI"][id*="_491932"]').css("display", "none");
        const driverName = getDriverName(multiIndex);
        if (driverName) {
          $(`#collapse_Driver_MI${multiIndex}_493260 .inf-driver-name`).html(
            driverName
          );
        }
        //summariseInfraction(document.querySelector(`#Driver_MI${multiIndex}`))
      }
    );

    // Handle driver collapse click
    $("span#driver_collapse").on("click", function (e) {
      e.stopPropagation();
      $(".inf-side-drawer-container, .side-drawer-container").hide();
      prefillCurrentInfraction($(this).closest(".infraction-details"));
    });

    // Handle infraction 'No' selection
    $(document).on(
      "change",
      ".infraction-details > .instanda-question-parent-yes-no > .instanda-text-question .instanda-question-yes-no-parent-no input",
      function (e) {
        const $thisHeader = $(this).closest(".group-question-collapse");
        $(this).closest(".infraction-details").appendTo($thisHeader);
        //summariseInfraction(e.target.closest("div[data-summary-header='Driver_MI_summary']"))
      }
    );

    // Handle driver infraction collapse click
    $("span#driver_inf_collapse").on("click", function (e) {
      e.stopPropagation(); // Prevents the parent click handler from firing
      $(".inf-side-drawer-container").hide();
      prefillCurrentInfraction($(this).closest(".infraction-details"));
    });

    // Handle 'Yes' infraction selection
    $(document).on(
      "click",
      '[id^="Driver_MI"][id*="_Infraction"][id*="_Add_YNPYes"]',
      function () {
        const id = this.id;
        const match = id.match(/^Driver_MI(\d+)_Infraction(\d+)_Add_YNPYes$/);
        if (!match) {
          console.error(`Invalid infraction ID format: ${id}`);
          return;
        }
        const [_, multiIndex, infractionIndex] = match;
        const driverName = getDriverName(multiIndex);
        const $target = $(
          `#Infraction${infractionIndex}_Add_YNP__24355__${multiIndex}_Children .inf-det-list-view .inf-side-drawer-container`
        );
        $target.css("display", "flex");
        if (driverName) {
          $target.find(".inf-driver-name").html(driverName);
        }
      }
    );

    // Handle infraction list view click
    $(document).on("click", ".inf-det-list-view", function () {
      $(this).find(".inf-side-drawer-container").css("display", "flex");
    });

    // Handle infraction input changes
    document
      .querySelectorAll(".infraction-details .instanda-question-input label")
      .forEach((button) => {
        button.addEventListener("click", () =>
          setTimeout(debouncedCleanRecord, 0)
        );
      });

    /*
      document.querySelectorAll("#driver_inf_collapse").forEach(button => button.addEventListener("click", function (e) {
         summariseInfraction(e.target.closest("div[data-summary-header='Driver_MI_summary']"));
      }))
      
      document.querySelectorAll("#driver_collapse").forEach(button => button.addEventListener("click", function (e) {
          summariseInfraction(e.target.closest("div[data-summary-header='Driver_MI_summary']"));
      }))
      */

    // show/hide fault Indicator because prior ones not working
    $(".infraction-details").each(function () {
      const source = $(this).find("[id^='Driver_MI'][id$='_Source_TXT']");
      const infractionType = $(this).find(
        "[id^='Driver_MI'][id$='_Type_CHOICEP']"
      );
      const fltIndi = $(this).find(".fltIndi");
      if (source.val() !== "Manual" && infractionType.val() === "Accident")
        fltIndi.show();
      else fltIndi.hide();
    });
  }

  // BH-20721 Customer data prefill auto
  // $(document).ready(function () {
  //   if ($(".page-quickquotequestions.page-number-1.package-24338").length > 0) {
  //     [
  //       { "PrefilVar": "PrefillFirstName_TXT", "NormalVar": "FirstName_TXT" },
  //       { "PrefilVar": "PrefillMiddleName_TXT", "NormalVar": "MiddleName_TXT" },
  //       { "PrefilVar": "PrefillLastName_TXT", "NormalVar": "LastName_TXT" },
  //       { "PrefilVar": "PrefillDOB_DATE", "NormalVar": "DOB_DATE" },
  //       { "PrefilVar": "PrefillAddressLine1_TXT", "NormalVar": "RiskAddressLine1RO_TXT" },
  //       { "PrefilVar": "PrefillAddressLine2_TXT", "NormalVar": "RiskAddressLine2RO_TXT" },
  //       { "PrefilVar": "PrefillCity_TXT", "NormalVar": "RiskCityRO_TXT" },
  //       { "PrefilVar": "PrefillState_CHOICE", "NormalVar": "RiskStateRO_TXT", type: "select" },
  //       { "PrefilVar": "PrefillZipCode_TXT", "NormalVar": "RiskPostCodeRO_TXT" },
  //       { "PrefilVar": "PrefillCountry_CHOICE", "NormalVar": "RiskCountryRO_TXT", type: "select" },
  //     ].forEach((value) => {
  //       const prefillVar = $(`${value.type || "input"}[name=${value.PrefilVar}]`);
  //       if (prefillVar.length > 0 && !prefillVar.val()) {
  //         prefillVar.val($(`${value.type || "input"}[name=${value.NormalVar}]`).val()).trigger("change")
  //       }
  //     })
  //   }
  // })

  // summarise infraction and highlights clean record
  async function newCleanRecord() {
    if (
      document.querySelectorAll("[id^='li_Driver_MI'][id$='_D_FirstName_TXT']")
      .length === 0 ||
      (document.querySelectorAll(
          `#question501696 .instanda-question-yes-no-yes.instanda-selected`
        ).length === 0 &&
        document.querySelectorAll(
          `#question501520 .instanda-question-yes-no-yes.instanda-selected`
        ).length === 0)
    )
      return;
    showSpinner();
    try {
      const response = await getQuoteData();
      const infractions =
        response.Infraction_MI_Count > 0 ? response.Infraction_MI : [];
      const claims = response.Claim_MI_Count > 0 ? response.Claim_MI : [];
      const infractionSummary = {};
      const currentDate = new Date();

      console.log(infractions, "\n", claims);

      // Helper to initialize summary object
      function getOrInitSummary(driver) {
        if (!infractionSummary[driver]) {
          infractionSummary[driver] = {
            accidentCount: 0,
            convictionCount: 0,
            totalPoints: 0,
            totalPointsLessthn3yrs: 0,
            totalPointsLessthn5yrs: 0,
          };
        }
        return infractionSummary[driver];
      }

      // Process infractions
      for (const infraction of infractions) {
        const driver = infraction.Inf_DriverFLName_TXT || "";
        const points = Number(infraction.C_Points_DI_NUM) || 0;
        const infractionDateStr = infraction.Infraction_ViolationAccident_DATE;
        let points3yrs = 0,
          points5yrs = 0;

        if (infractionDateStr) {
          const infractionDate = new Date(infractionDateStr);
          const yearsAgo =
            (currentDate - infractionDate) / (1000 * 60 * 60 * 24 * 365);
          if (yearsAgo <= 3) points3yrs += points;
          if (yearsAgo <= 5) points5yrs += points;
        }

        const summary = getOrInitSummary(driver.toLowerCase());
        summary.totalPoints += points;
        summary.totalPointsLessthn3yrs += points3yrs;
        summary.totalPointsLessthn5yrs += points5yrs;

        if (infraction.Infraction_Type_CHOICE === "Conviction") {
          summary.convictionCount += 1;
        }
        if (infraction.Infraction_Type_CHOICE === "Accident") {
          summary.accidentCount += 1;
        }
      }

      // Process claims (accidents)
      for (const claim of claims) {
        const driver = claim.Claim_DriverFLName_TXT || "";
        const summary = getOrInitSummary(driver.toLowerCase());
        summary.accidentCount += 1;
      }

      console.log(infractionSummary);

      // Highlight drivers and fill in summary
      const driversEle = document.querySelectorAll(
        "[id^='li_Driver_MI'][id$='_D_FirstName_TXT']"
      );
      const convictedDrivers = Object.keys(infractionSummary);

      for (let driverEle of driversEle) {
        const pattern = driverEle.id.match(
          /^li_Driver_MI(\d+)_D_FirstName_TXT$/
        );
        if (!pattern) continue;
        const miIndex = pattern[1];

        const indicator =
          document.querySelector(
            `#Driver_MI${miIndex} #question501696 .instanda-question-yes-no-yes.instanda-selected`
          ) ||
          document.querySelector(
            `#Driver_MI${miIndex} #question501520 .instanda-question-yes-no-yes.instanda-selected`
          );
        if (!indicator) continue;

        const lastNameEle = document.querySelector(
          `#li_Driver_MI${miIndex}_D_LastName_TXT`
        );
        if (!lastNameEle) continue;
        const fullName =
          driverEle.textContent.trim().toLowerCase() +
          " " +
          lastNameEle.textContent.trim().toLowerCase();
        console.log(fullName);

        if (infractionSummary[fullName]) {
          const summary = infractionSummary[fullName];

          // Accident count
          const accidentInput = document.querySelector(
            `#Driver_MI${miIndex} #question486113 input`
          );
          if (accidentInput) accidentInput.value = summary.accidentCount;

          // Conviction count
          const convInput = document.querySelector(
            `#Driver_MI${miIndex} #question486114 input`
          );
          if (convInput) convInput.value = summary.convictionCount;

          // Total points
          const pointsInput = document.querySelector(
            `#Driver_MI${miIndex} #question486115 input`
          );
          if (pointsInput) pointsInput.value = summary.totalPoints;

          // Points within 3 years
          const points3Input = document.querySelector(
            `#Driver_MI${miIndex} #question486116 input`
          );
          if (points3Input) points3Input.value = summary.totalPointsLessthn3yrs;

          // Points within 5 years
          const points5Input = document.querySelector(
            `#Driver_MI${miIndex} #question486117 input`
          );
          if (points5Input) points5Input.value = summary.totalPointsLessthn5yrs;

          driverEle.style.color = "red";
        } else driverEle.style.color = "green";
      }
      hideSpinner();
    } catch (e) {
      console.log(e);
      hideSpinner();
      setTimeout(() => {
        alert("Clean Record Indicator Failed");
      }, 10);
    }
  }

  // Initial call on DOM ready
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-2.package-24338").length > 0) {
      handleInfractions();
      setTimeout(newCleanRecord, 100);
    }
  });

  ////////Location Fillup

  // =====================================================
  // GARAGE ADDRESS DROPDOWN
  // Backspace/Delete blocked |
  // =====================================================
  (() => {
    if (
      !document.querySelector(
        ".page-quickquotequestions.page-number-4.package-24338"
      )
    )
      return;

    let currentDropdown = null;

    let cachedAddresses = null;
    let cacheTime = 0;
    const CACHE_DURATION = 800; // Re-calculate only every 800ms max

    const getStateCodeSafe = (state) => {
      try {
        return getStateCode(state);
      } catch {
        return "";
      }
    };

    const isGarageAddActive = (garage) => {
      const parent = garage.closest('[id*="_Children"]');
      if (!parent) return true;
      return window.getComputedStyle(parent).display !== "none";
    };

    // Removes commas inside a single field (Line1/City/etc)
    const cleanField = (v) =>
      String(v ?? "")
      .replace(/,/g, " ") // <-- remove/neutralize commas inside fields
      .replace(/\s+/g, " ")
      .trim();

    // Ensures a "listed address string" always becomes exactly 6 comma-separated parts.
    // If extra commas exist (usually from Line1), merges extras into part 1.
    const normalizeListedAddressString = (raw) => {
      const s = String(raw ?? "").trim();
      if (!s) return "";

      let parts = s.split(",").map((x) => String(x ?? "").trim());

      if (parts.length > 6) {
        const extras = parts.length - 6; // number of extra splits
        const one = parts.slice(0, extras + 1).join(" "); // merge extras into line1
        const rest = parts.slice(extras + 1); // should be 5 parts
        parts = [one, ...rest];
      }

      while (parts.length < 6) parts.push("");
      parts = parts.slice(0, 6);

      const cleaned = parts.map(cleanField);
      return cleaned.join(", ");
    };

    // FAST + CACHED version
    const getGarageAddresses = () => {
      const now = Date.now();
      if (cachedAddresses && now - cacheTime < CACHE_DURATION) {
        return cachedAddresses;
      }

      const addresses = [];

      document.querySelectorAll(".garageAdd").forEach((garage) => {
        if (!isGarageAddActive(garage)) return;

        const getClean = (sel) =>
          cleanField(garage.querySelector(sel)?.value ?? "");

        const line1 = getClean(".instanda-address-line-1 input");
        const line2 = getClean(".instanda-address-line-2 input");
        const city = getClean(".instanda-address-city input");
        const state = cleanField(
          garage.querySelector(".instanda-address-state select")?.value ?? ""
        );
        const zip = getClean(".instanda-address-postcode input");
        const country = cleanField(
          garage.querySelector(".instanda-address-country select")?.value ?? ""
        );

        if (
          !line1 ||
          !city ||
          !state ||
          !zip ||
          !country ||
          state === "Please select..."
        )
          return;

        if (state !== getStateCodeSafe(Instanda.Variables.PremiumState_CHOICE))
          return;

        addresses.push([line1, line2, city, state, zip, country].join(", "));
      });

      // MA_Address_CALC (normalize so it stays 6 parts even if commas exist)
      if (
        Instanda.Variables.MA_Address_CALC?.trim() &&
        getStateCodeSafe(Instanda.Variables.PremiumState_CHOICE) ===
        Instanda.Variables.MA_State_CHOICE_DD
      ) {
        const norm = normalizeListedAddressString(
          Instanda.Variables.MA_Address_CALC
        );
        if (norm) addresses.push(norm);
      }

      // PrefillAddress_CALC (normalize so it stays 6 parts even if commas exist)
      if (
        Instanda.Variables.PrefillAddress_CALC?.trim() &&
        getStateCodeSafe(Instanda.Variables.PremiumState_CHOICE) ===
        Instanda.Variables.PrefillState_CHOICE
      ) {
        const norm = normalizeListedAddressString(
          Instanda.Variables.PrefillAddress_CALC
        );
        if (norm) addresses.push(norm);
      }

      cachedAddresses = addresses;
      cacheTime = now;
      return addresses;
    };

    // Invalidate cache when garage fields change
    $(document).on(
      "change input",
      ".garageAdd input, .garageAdd select",
      () => {
        cachedAddresses = null;
      }
    );

    const removeDropdown = () => {
      if (currentDropdown?.isConnected) currentDropdown.remove();
      currentDropdown = null;
    };

    const setupDropdownForInput = (input) => {
      removeDropdown();

      const addresses = getGarageAddresses(); // cached

      // If input has a value, normalize it (so embedded commas won't break later)
      const raw = String(input.value ?? "").trim();
      if (raw) {
        const candidate = raw.includes(",") ?
          normalizeListedAddressString(raw) :
          raw;

        if (!addresses.includes(candidate)) {
          input.value = "";
        } else {
          input.value = candidate;
        }
      }

      // Default to first address from dropdown if input is empty
      const firstAddress = addresses.length > 0 ? addresses[0] : "";
      if (!input.value && firstAddress) {
        input.value = firstAddress;
      }

      input.placeholder = "Please select...";

      const dropdown = document.createElement("div");
      dropdown.className = "custom-garage-dropdown";
      Object.assign(dropdown.style, {
        position: "absolute",
        background: "#fff",
        border: "1px solid #ccc",
        borderRadius: "6px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        zIndex: 99999,
        maxHeight: "200px",
        overflowY: "auto",
        fontSize: "14px",
        padding: "6px 0",
        transition: "opacity 0.1s",
      });

      const addItem = (text, value) => {
        const item = document.createElement("div");
        item.textContent = text;
        item.style.cssText =
          "padding:10px 16px; cursor:pointer; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
        item.onmousedown = (e) => {
          e.preventDefault();
          input.value = value;
          removeDropdown();
        };
        item.onmouseover = () => (item.style.backgroundColor = "#041e42");
        item.onmouseout = () => (item.style.backgroundColor = "");
        dropdown.appendChild(item);
      };

      addItem("Please select...", "");
      addresses.forEach((addr) => addItem(addr, addr));

      document.body.appendChild(dropdown);
      currentDropdown = dropdown;

      const pos = () => {
        const r = input.getBoundingClientRect();
        dropdown.style.left = r.left + window.scrollX + "px";
        dropdown.style.top = r.bottom + window.scrollY + 4 + "px";
        dropdown.style.width = r.width + "px";
      };
      pos();

      // Ultra-smooth positioning
      const rafPos = () => requestAnimationFrame(pos);
      window.addEventListener("scroll", rafPos, true);
      window.addEventListener("resize", rafPos);

      // BLOCK ALL TYPING + BACKSPACE + DELETE
      input.addEventListener("keydown", (e) => {
        if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete") {
          e.preventDefault();
        }
      });

      // Hide on blur
      input.addEventListener("blur", () => setTimeout(removeDropdown, 180));
    };

    const attach = () => {
      document.querySelectorAll(".prefill-location input").forEach((input) => {
        setupDropdownForInput(input);
        input.onclick = input.onfocus = () => setupDropdownForInput(input);
      });
    };

    // Run instantly
    $(attach);

    $(document).on("click", "#Vehicle_MIaddButton", () =>
      setTimeout(attach, 250)
    );

    // Close on outside click
    document.body.addEventListener("click", (e) => {
      if (
        !e.target.closest(".prefill-location input, .custom-garage-dropdown")
      ) {
        removeDropdown();
      }
    });

    console.log("Garage Dropdown → ZERO LAG + LOCKED → ACTIVE");
  })();

  //Referral Rule for C/o Auto
  $(document).ready(function () {
    if ($(".page-quickquotequestions.page-number-4.package-24338").length > 0) {
      setInterval(function () {
        try {
          let flag = false;
          const pattern = /\b(c\/o|coa|c\.o\.a)\b/i;
          document
            .querySelectorAll(
              ".garageAdd .instanda-address-line-1 input, .prefill-location input"
            )
            .forEach(function (input) {
              if (
                input &&
                typeof input.value === "string" &&
                isAddActive(input) &&
                pattern.test(input.value)
              ) {
                flag = true;
              }
            });
          $("#AddressRefIndicator_TXT").val(flag);
        } catch (e) {
          console.error("Error in address check interval:", e);
          // Optionally, you can set a fallback state or flag here if needed
        }
      }, 1000);
    }

    function isAddActive(garage) {
      if (!garage || typeof garage.closest !== "function") return false;
      const parent = garage.closest('[id*="_Children"]');
      if (!parent) return true;
      const style = window.getComputedStyle(parent);
      return style.display !== "none";
    }
  });
