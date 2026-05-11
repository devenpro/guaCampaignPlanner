  // ============================================================
  // SECTION 4: AI RESPONSE PARSING
  // ============================================================

  function parseJSON(text) {
    if (!text || !text.trim()) throw new Error('Empty AI response');
    try { return JSON.parse(text); } catch(e) {}
    var cleaned = text.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
    try { return JSON.parse(cleaned); } catch(e) {}
    var objStr = extractBraceBlock(cleaned, '{', '}');
    if (objStr) { try { return JSON.parse(objStr); } catch(e) {} }
    var arrStr = extractBraceBlock(cleaned, '[', ']');
    if (arrStr) { try { return JSON.parse(arrStr); } catch(e) {} }
    if (objStr) { var relaxed = objStr.replace(/,\s*([}\]])/g, '$1'); try { return JSON.parse(relaxed); } catch(e) {} }
    throw new Error('Could not parse AI response as JSON');
  }

  function extractBraceBlock(text, openChar, closeChar) {
    var start = text.indexOf(openChar); if (start === -1) return null;
    var depth = 0, inStr = false, escaped = false;
    for (var i = start; i < text.length; i++) {
      var ch = text[i];
      if (escaped) { escaped = false; continue; }
      if (ch === '\\') { escaped = true; continue; }
      if (ch === '"') { inStr = !inStr; continue; }
      if (inStr) continue;
      if (ch === openChar) depth++;
      if (ch === closeChar) { depth--; if (depth === 0) return text.substring(start, i + 1); }
    }
    return null;
  }

