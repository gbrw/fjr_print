document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Loaded - Initializing App v2");

    // === Global Elements ===
    const elements = {
        textInputs: [document.getElementById('text1'), document.getElementById('text2'), document.getElementById('text3')],
        fontSizes: [document.getElementById('font-size1'), document.getElementById('font-size2'), document.getElementById('font-size3')],
        fontFamilies: [document.getElementById('font-family1'), document.getElementById('font-family2'), document.getElementById('font-family3')],
        fontColors: [document.getElementById('font-color1'), document.getElementById('font-color2'), document.getElementById('font-color3')],
        bolds: [document.getElementById('bold1'), document.getElementById('bold2'), document.getElementById('bold3')],
        italics: [document.getElementById('italic1'), document.getElementById('italic2'), document.getElementById('italic3')],
        underlines: [document.getElementById('underline1'), document.getElementById('underline2'), document.getElementById('underline3')],
        previewTexts: [document.getElementById('preview-text1'), document.getElementById('preview-text2'), document.getElementById('preview-text3')],
        preview: document.getElementById('preview'),
        bgLayer: document.querySelector('.background-layer'),
        bgImageInput: document.getElementById('background-image'),
        bgOpacitySlider: document.getElementById('background-opacity'),
        opacityValueSpan: document.getElementById('opacity-value'),
        orientationRadios: document.querySelectorAll('input[name="orientation"]'),
        bgOptions: document.querySelectorAll('input[name="background-option"]'),
        customBgOption: document.getElementById('custom-background-option'),
        borderStyleSelect: document.getElementById('border-style'),
        borderWidthInput: document.getElementById('border-width'),
        borderColorInput: document.getElementById('border-color-value'),
        printBtn: document.getElementById('print-btn'),
        loadingOverlay: document.getElementById('loading-overlay'),
        textControlDivs: document.querySelectorAll('.text-controls'),
        borderColorDiv: document.querySelector('.border-control .color-control'),
    };

    const colors = ["#FF0000", "#FF6600", "#FFCC00", "#009900", "#0066CC", "#9900CC", "#000000", "#2ecc71", "#e74c3c", "#3498db", "#f1c40f", "#9b59b6", "#1abc9c", "#e67e22", "#34495e", "#FFFFFF"];

    // === Functions ===

    function generateColorPresets(container, targetInput) {
        const presetsDiv = container.querySelector('.color-presets');
        if (!presetsDiv || !targetInput) return; // Exit if elements not found

        presetsDiv.innerHTML = '';
        colors.forEach(color => {
            const preset = document.createElement('div');
            preset.className = 'color-preset';
            preset.dataset.color = color;
            preset.style.backgroundColor = color;
            if (color === '#FFFFFF') preset.style.border = '1px solid #ccc';

            preset.addEventListener('click', () => {
                targetInput.value = color;
                presetsDiv.querySelectorAll('.color-preset').forEach(p => p.classList.remove('active'));
                preset.classList.add('active');
                updatePreview();
            });
            presetsDiv.appendChild(preset);
        });

        const currentVal = targetInput.value;
        const activePreset = Array.from(presetsDiv.children).find(p => p.dataset.color === currentVal) || presetsDiv.children[0];
        if (activePreset) {
            activePreset.classList.add('active');
            targetInput.value = activePreset.dataset.color;
        }
    }

    function updatePreview() {
        try {
            elements.textInputs.forEach((input, i) => {
                elements.previewTexts[i].textContent = input.value;
                elements.previewTexts[i].style.fontSize = elements.fontSizes[i].value + 'px';
                elements.previewTexts[i].style.fontFamily = elements.fontFamilies[i].value;
                elements.previewTexts[i].style.color = elements.fontColors[i].value;
                elements.previewTexts[i].style.fontWeight = elements.bolds[i].checked ? 'bold' : 'normal';
                elements.previewTexts[i].style.fontStyle = elements.italics[i].checked ? 'italic' : 'normal';
                elements.previewTexts[i].style.textDecoration = elements.underlines[i].checked ? 'underline' : 'none';
            });

            const selectedBgOption = document.querySelector('input[name="background-option"]:checked').value;
            elements.bgLayer.style.opacity = elements.bgOpacitySlider.value;

            if (selectedBgOption === 'default') {
                elements.bgLayer.style.backgroundImage = 'url("alfajr.PNG")';
            } else if (selectedBgOption === 'custom' && elements.bgImageInput.files[0]) {
                const reader = new FileReader();
                reader.onload = e => { elements.bgLayer.style.backgroundImage = `url(${e.target.result})`; };
                reader.readAsDataURL(elements.bgImageInput.files[0]);
            } else {
                elements.bgLayer.style.backgroundImage = 'none';
            }

            const bs = elements.borderStyleSelect.value;
            const bw = elements.borderWidthInput.value;
            const bc = elements.borderColorInput.value;
            const borderValue = (bs !== 'none') ? `${bw}px ${bs} ${bc}` : '1px solid #ccc';
            elements.preview.style.border = borderValue;
            document.documentElement.style.setProperty('--print-border', (bs !== 'none') ? `${bw}px ${bs} ${bc}` : 'none');
        } catch (error) {
            console.error("Error during updatePreview:", error);
        }
    }

    function updateOrientation() {
        try {
            const selectedOrientation = document.querySelector('input[name="orientation"]:checked').value;
            const previewEl = elements.preview;
            let styleEl = document.getElementById('print-orientation-style');

            if (!styleEl) {
                styleEl = document.createElement('style');
                styleEl.id = 'print-orientation-style';
                document.head.appendChild(styleEl);
                console.log("Created print orientation style tag.");
            }

            if (selectedOrientation === 'landscape') {
                previewEl.classList.remove('portrait');
                previewEl.classList.add('landscape');
                styleEl.textContent = `@page { size: A4 landscape; margin: 0; }`;
            } else {
                previewEl.classList.remove('landscape');
                previewEl.classList.add('portrait');
                styleEl.textContent = `@page { size: A4 portrait; margin: 0; }`;
            }
             console.log(`Orientation set to: ${selectedOrientation}`);

            if (!window.matchMedia('(max-width: 768px)').matches) {
               if (selectedOrientation === 'landscape') {
                   previewEl.style.width = '297mm'; previewEl.style.height = '210mm';
               } else {
                   previewEl.style.width = '210mm'; previewEl.style.height = '297mm';
               }
            }
        } catch (error) {
            console.error("Error during updateOrientation:", error);
        }
    }

    function handlePrint() {
        console.log("----- PRINT ATTEMPT -----");
        try {
            console.log("1. Updating orientation before print...");
            updateOrientation(); // Ensure @page rule is fresh

            console.log("2. Calling window.print()...");
            window.print(); // THE ACTUAL PRINT CALL

            console.log("3. window.print() was called. Check print dialog.");
        } catch (error) {
            console.error("4. ERROR during printing process:", error);
            alert("حدث خطأ أثناء محاولة الطباعة. يرجى التحقق من وحدة التحكم (F12).");
        }
        console.log("----- PRINT ATTEMPT END -----");
    }

    // === Event Listeners Setup ===
    console.log("Adding event listeners...");

    Object.values(elements).flat().forEach(el => {
        if (!el && !Array.isArray(el)) {
            console.warn("An element was not found during setup. Check HTML IDs.");
        }
    });

    const inputsToUpdate = [
        ...elements.textInputs, ...elements.fontSizes, ...elements.bolds,
        ...elements.italics, ...elements.underlines, elements.borderWidthInput,
        elements.bgImageInput, elements.bgOpacitySlider
    ];
    inputsToUpdate.forEach(el => {
        if (el) el.addEventListener('input', updatePreview);
    });

    const changesToUpdate = [
        ...elements.fontFamilies, elements.borderStyleSelect,
        ...elements.bgOptions, ...elements.orientationRadios
    ];
    changesToUpdate.forEach(el => {
        if(el) el.addEventListener('change', updatePreview);
    });
    
    // Specific listener for orientation change
    elements.orientationRadios.forEach(radio => radio.addEventListener('change', updateOrientation));

    // Opacity
    if (elements.bgOpacitySlider) {
        elements.bgOpacitySlider.addEventListener('input', () => {
            elements.opacityValueSpan.textContent = Math.round(elements.bgOpacitySlider.value * 100) + '%';
        });
    }

     // Background Options
    if (elements.bgOptions) {
        elements.bgOptions.forEach(radio => radio.addEventListener('change', () => {
             elements.customBgOption.style.display =
                (document.querySelector('input[name="background-option"]:checked').value === 'custom') ? 'block' : 'none';
        }));
    }

    // Print Button (CRITICAL CHECK)
    if (elements.printBtn) {
        console.log("Print button FOUND. Adding listener.");
        elements.printBtn.addEventListener('click', (event) => {
            event.preventDefault(); // Good practice
            handlePrint();
        });
    } else {
        console.error("!!! FATAL: PRINT BUTTON NOT FOUND (#print-btn) !!!");
        alert("خطأ: لم يتم العثور على زر الطباعة. لا يمكن الطباعة.");
    }

    // === Initialization ===
    console.log("Running initial setup...");
    elements.textControlDivs.forEach((div, index) => {
        generateColorPresets(div, elements.fontColors[index]);
    });
    if (elements.borderColorDiv) {
        generateColorPresets(elements.borderColorDiv, elements.borderColorInput);
    }
    updateOrientation();
    updatePreview();

    if (elements.loadingOverlay) {
        elements.loadingOverlay.style.opacity = '0';
        setTimeout(() => { elements.loadingOverlay.style.display = 'none'; }, 500);
    }
    console.log("Initialization complete. Ready.");
});
