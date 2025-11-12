// src/components/common/CodeSyntaxHighlighter.tsx

"use client";

import { useMemo } from "react";
import type { CodeSnippet } from "@/types";
import "./styles/CodeSyntaxHighlighter.css";

interface CodeSyntaxHighlighterProps {
  codeSnippet: CodeSnippet;
  className?: string;
  showHeader?: boolean;
  height?: string;
}

// Enhanced syntax highlighting patterns for multiple languages
const getSyntaxHighlightingRules = (language: string) => {
  const baseRules = {
    // Comments
    comment: {
      pattern: /\/\/.*|\/\*[\s\S]*?\*\/|#.*|<!--[\s\S]*?-->|--.*$/gm,
    },
    // Strings
    string: {
      pattern: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/g,
    },
    // Numbers
    number: {
      pattern: /\b\d+\.?\d*\b/g,
    },
    // Functions and Methods
    function: {
      pattern: /\b\w+(?=\s*\()/g,
    },
  };

  const languageSpecificRules = {
    javascript: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|new|this|typeof|instanceof|class|extends|import|export|from|async|await|Promise|null|undefined|true|false)\b/g,
      },
      // Built-in objects
      builtin: {
        pattern: /\b(?:console|window|document|Array|Object|String|Number|Boolean|Date|Math|JSON|parseInt|parseFloat|isNaN|Error)\b/g,
      },
    },
    typescript: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:const|let|var|function|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|new|this|typeof|instanceof|class|extends|import|export|from|async|await|Promise|null|undefined|true|false|interface|type|enum|namespace|declare|abstract|readonly|private|public|protected|static)\b/g,
      },
      // Types
      type: {
        pattern: /\b(?:string|number|boolean|void|any|unknown|never|object)\b|:\s*\w+/g,
      },
      // Built-in objects
      builtin: {
        pattern: /\b(?:console|window|document|Array|Object|String|Number|Boolean|Date|Math|JSON|parseInt|parseFloat|isNaN|Error)\b/g,
      },
    },
    python: {
      ...baseRules,
      comment: {
        pattern: /#.*$/gm,
      },
      // Keywords
      keyword: {
        pattern: /\b(?:def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|lambda|and|or|not|in|is|None|True|False|pass|break|continue|global|nonlocal|assert|del|raise)\b/g,
      },
      // Built-in functions
      builtin: {
        pattern: /\b(?:print|len|range|enumerate|zip|map|filter|sorted|sum|max|min|abs|round|isinstance|type|str|int|float|bool|list|dict|set|tuple|open|input)\b/g,
      },
    },
    java: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|new|this|super|return|if|else|for|while|do|switch|case|default|break|continue|try|catch|finally|throw|throws|void|int|double|float|long|short|byte|char|boolean|String)\b/g,
      },
      // Built-in classes
      builtin: {
        pattern: /\b(?:System|String|Integer|Double|Float|Boolean|ArrayList|HashMap|List|Map|Set|Collection)\b/g,
      },
    },
    cpp: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:int|double|float|char|bool|void|const|static|public|private|protected|class|struct|namespace|using|include|define|if|else|for|while|do|switch|case|default|break|continue|return|new|delete|this|virtual|override|template|typename)\b/g,
      },
      // Preprocessor
      preprocessor: {
        pattern: /#\w+/g,
      },
      // Built-in functions
      builtin: {
        pattern: /\b(?:cout|cin|endl|std|printf|scanf|malloc|free|sizeof)\b/g,
      },
    },
    c: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:int|double|float|char|void|const|static|struct|union|enum|typedef|if|else|for|while|do|switch|case|default|break|continue|return|sizeof|auto|register|extern|signed|unsigned|short|long)\b/g,
      },
      // Preprocessor
      preprocessor: {
        pattern: /#\w+/g,
      },
      // Built-in functions
      builtin: {
        pattern: /\b(?:printf|scanf|malloc|free|strlen|strcpy|strcmp|strcat|memcpy|memset)\b/g,
      },
    },
    go: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var)\b/g,
      },
      // Built-in functions
      builtin: {
        pattern: /\b(?:append|cap|close|complex|copy|delete|imag|len|make|new|panic|print|println|real|recover)\b/g,
      },
    },
    rust: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:as|break|const|continue|crate|else|enum|extern|false|fn|for|if|impl|in|let|loop|match|mod|move|mut|pub|ref|return|self|Self|static|struct|super|trait|true|type|unsafe|use|where|while)\b/g,
      },
      // Built-in types
      builtin: {
        pattern: /\b(?:i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result)\b/g,
      },
    },
    php: {
      ...baseRules,
      comment: {
        pattern: /\/\/.*|\/\*[\s\S]*?\*\/|#.*$/gm,
      },
      // Keywords
      keyword: {
        pattern: /\b(?:abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield)\b/g,
      },
      // Variables
      variable: {
        pattern: /\$\w+/g,
      },
    },
    ruby: {
      ...baseRules,
      comment: {
        pattern: /#.*$/gm,
      },
      // Keywords
      keyword: {
        pattern: /\b(?:alias|and|begin|break|case|class|def|defined|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield)\b/g,
      },
      // Built-in methods
      builtin: {
        pattern: /\b(?:puts|print|p|gets|chomp|to_s|to_i|to_f|length|size|empty|nil|class|methods)\b/g,
      },
    },
    swift: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:associatedtype|class|deinit|enum|extension|fileprivate|func|import|init|inout|internal|let|open|operator|private|protocol|public|static|struct|subscript|typealias|var|break|case|continue|default|defer|do|else|fallthrough|for|guard|if|in|repeat|return|switch|where|while|as|catch|false|is|nil|rethrows|super|self|Self|throw|throws|true|try|Any|AnyObject|Type|String|Int|Double|Float|Bool|Array|Dictionary|Set)\b/g,
      },
      // Built-in types
      builtin: {
        pattern: /\b(?:String|Int|Double|Float|Bool|Array|Dictionary|Set|Optional|Any|AnyObject)\b/g,
      },
    },
    kotlin: {
      ...baseRules,
      // Keywords
      keyword: {
        pattern: /\b(?:abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|false|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|private|protected|public|reified|return|sealed|set|super|suspend|tailrec|this|throw|true|try|typealias|typeof|val|var|vararg|when|where|while)\b/g,
      },
      // Built-in types
      builtin: {
        pattern: /\b(?:String|Int|Double|Float|Boolean|Long|Short|Byte|Char|Array|List|MutableList|Set|MutableSet|Map|MutableMap|Any|Unit)\b/g,
      },
    },
    html: {
      ...baseRules,
      // HTML tags
      tag: {
        pattern: /<\/?[a-zA-Z][^>]*>/g,
      },
      // Attributes
      attribute: {
        pattern: /\s[a-zA-Z-]+(?==)/g,
      },
      // Attribute values
      attributeValue: {
        pattern: /="[^"]*"/g,
      },
    },
    css: {
      ...baseRules,
      // CSS selectors
      selector: {
        pattern: /[.#]?[a-zA-Z][a-zA-Z0-9-]*(?=\s*{)/g,
      },
      // CSS properties
      property: {
        pattern: /[a-zA-Z-]+(?=\s*:)/g,
      },
      // CSS values
      value: {
        pattern: /:\s*[^;]+/g,
      },
    },
    sql: {
      ...baseRules,
      comment: {
        pattern: /--.*$/gm,
      },
      // SQL keywords
      keyword: {
        pattern: /\b(?:SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|JOIN|LEFT|RIGHT|INNER|OUTER|ON|GROUP|BY|ORDER|HAVING|DISTINCT|COUNT|SUM|AVG|MAX|MIN|AS|AND|OR|NOT|NULL|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|UNIQUE|CHECK|DEFAULT)\b/gi,
      },
      // Data types
      datatype: {
        pattern: /\b(?:VARCHAR|INT|INTEGER|DECIMAL|DATE|TIME|TIMESTAMP|BOOLEAN|TEXT|CHAR|FLOAT|DOUBLE|BIGINT|SMALLINT|TINYINT)\b/gi,
      },
    },
  };

  return languageSpecificRules[language as keyof typeof languageSpecificRules] || baseRules;
};

// Apply syntax highlighting to code using CSS classes with proper conflict resolution
const highlightSyntax = (code: string, language: string): string => {
  const rules = getSyntaxHighlightingRules(language);
  let highlightedCode = code;

  // Create a map to track which characters are already inside spans
  const createSpanMap = (text: string): boolean[] => {
    const spanMap = new Array(text.length).fill(false);
    const spanRegex = /<span[^>]*>.*?<\/span>/g;
    let match;
    
    while ((match = spanRegex.exec(text)) !== null) {
      for (let i = match.index; i < match.index + match[0].length; i++) {
        spanMap[i] = true;
      }
    }
    
    return spanMap;
  };

  // Apply syntax highlighting rules in order of priority, avoiding conflicts
  const ruleOrder = [
    'comment',    // Highest priority - comments should override everything
    'string',     // Strings are usually high priority
    'preprocessor', 
    'keyword', 
    'builtin', 
    'type', 
    'datatype',
    'tag', 
    'attribute', 
    'attributeValue', 
    'selector', 
    'property', 
    'value', 
    'function', 
    'variable',
    'number'      // Numbers last - lowest priority
  ];
  
  ruleOrder.forEach(ruleName => {
    const rule = rules[ruleName as keyof typeof rules];
    if (rule) {
      // Create span map for current state
      const spanMap = createSpanMap(highlightedCode);
      
      // Find matches that don't conflict with existing spans
      const matches: { match: string; index: number; length: number }[] = [];
      let regexMatch;
      
      // Reset regex lastIndex to avoid issues with global regexes
      rule.pattern.lastIndex = 0;
      
      while ((regexMatch = rule.pattern.exec(highlightedCode)) !== null) {
        const matchStart = regexMatch.index;
        const matchEnd = matchStart + regexMatch[0].length;
        
        // Check if this match conflicts with existing spans
        let hasConflict = false;
        for (let i = matchStart; i < matchEnd; i++) {
          if (spanMap[i]) {
            hasConflict = true;
            break;
          }
        }
        
        if (!hasConflict) {
          matches.push({
            match: regexMatch[0],
            index: matchStart,
            length: regexMatch[0].length
          });
        }
        
        // Prevent infinite loops with zero-length matches
        if (regexMatch[0].length === 0) {
          rule.pattern.lastIndex++;
        }
      }
      
      // Apply matches in reverse order to maintain correct indices
      matches.reverse().forEach(({ match, index }) => {
        const before = highlightedCode.substring(0, index);
        const after = highlightedCode.substring(index + match.length);
        highlightedCode = before + `<span class="token-${ruleName}">${match}</span>` + after;
      });
    }
  });

  return highlightedCode;
};

// Get language display name
const getLanguageDisplayName = (language: string): string => {
  const languageNames: Record<string, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript", 
    python: "Python",
    java: "Java",
    cpp: "C++",
    c: "C",
    go: "Go",
    rust: "Rust",
    php: "PHP",
    ruby: "Ruby",
    swift: "Swift",
    kotlin: "Kotlin",
    html: "HTML",
    css: "CSS",
    sql: "SQL",
  };
  
  return languageNames[language] || language.charAt(0).toUpperCase() + language.slice(1);
};

export function CodeSyntaxHighlighter({
  codeSnippet,
  className = "",
  showHeader = true,
  height = "auto",
}: CodeSyntaxHighlighterProps) {
  const { language, code, description } = codeSnippet;

  // Memoize the highlighted code for performance
  const highlightedCode = useMemo(() => {
    if (!code) return "";
    return highlightSyntax(code, language);
  }, [code, language]);

  const displayName = getLanguageDisplayName(language);

  return (
    <div className={`code-syntax-container ${className}`}>
      {showHeader && (
        <div className="code-syntax-header">
          <div className="code-syntax-controls">
            <span className="code-syntax-dot code-syntax-dot-red"></span>
            <span className="code-syntax-dot code-syntax-dot-yellow"></span>
            <span className="code-syntax-dot code-syntax-dot-green"></span>
            <span className="code-syntax-language">{displayName}</span>
          </div>
          {description && (
            <span className="code-syntax-description">
              {description}
            </span>
          )}
        </div>
      )}
      <div 
        className="code-syntax-content"
        style={{ height: height !== "auto" ? height : undefined }}
      >
        <code
          className={`code-syntax-code language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
        />
      </div>
    </div>
  );
}

// Optional: Export a simpler version for inline code
interface InlineCodeProps {
  code: string;
  language?: string;
  className?: string;
}

export function InlineCode({ code, language = "text", className = "" }: InlineCodeProps) {
  const highlightedCode = useMemo(() => {
    return highlightSyntax(code, language);
  }, [code, language]);

  return (
    <code
      className={`px-2 py-1 bg-gray-800 text-gray-100 rounded text-sm font-mono ${className}`}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  );
}