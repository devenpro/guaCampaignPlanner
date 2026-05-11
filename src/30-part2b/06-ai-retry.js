  // ============================================================
  // SECTION 6: AI RETRY WRAPPER
  // ============================================================

  // callAIWithRetry: separates JSON parsing from business logic side-effects.
  // onSuccess(parsed) receives the already-parsed object/string.
  // parseResponse(text) is optional; if provided, it parses the raw text and throws on failure (triggering retry).
  // If no parseResponse is given, onSuccess receives raw text and errors are NOT retried.
  function callAIWithRetry(prompt, onSuccess, onError, actionId, systemPrompt, parseResponse) {
    LLMService.callAI(prompt, function(text) {
      var parsed;
      if (parseResponse) {
        try { parsed = parseResponse(text); }
        catch(parseErr) {
          console.warn('[CP] AI parse failed, retrying:', parseErr.message);
          var retryPrompt = prompt + '\n\nCRITICAL: Your previous response was not valid JSON. Respond with ONLY valid JSON. No markdown, no code fences, no text before or after.';
          toast('Retrying with stricter instructions...', 'info');
          LLMService.callAI(retryPrompt, function(text2) {
            var parsed2;
            try { parsed2 = parseResponse(text2); }
            catch(parseErr2) {
              console.error('[CP] AI retry parse also failed:', parseErr2.message);
              toast('AI response format error. Try a different model.', 'error');
              if (onError) onError('Parse error after retry: ' + parseErr2.message);
              return;
            }
            // Parse succeeded — run business logic outside try/catch
            onSuccess(parsed2);
          }, function(err) { if (onError) onError(err); }, actionId, systemPrompt);
          return;
        }
        // Parse succeeded — run business logic outside try/catch
        onSuccess(parsed);
      } else {
        // No parser provided — pass raw text, no retry on error
        onSuccess(text);
      }
    }, function(err) { if (onError) onError(err); }, actionId, systemPrompt);
  }

