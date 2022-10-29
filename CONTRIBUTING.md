## All PRs are welcomed

I don't have a coding style, but try to keep it similar to existing code, with just a couple notes:

- Please write comments. No need to write full paragraphs for each line, but at least a minor comment for functions or non-obvious blocks of code really help.

- Try to make meaningful commits, when possible. On a PR we'll probably check everything together, but later it's nicer to have a detailed git log. For example: don't create a unique commit with everything, but also avoid very small ones. Usually a commit for each functionality/fix/improvement is enough.

You can check existing code to see examples, but be aware that some are not perfect. In doubt, just ask.

This action doesn't use any external toolkits (no node_modules needed) because for me, it was easier to just create a single js with the logic.
However, I'm not opposed to using external ones if they help and reduce the amount of code (specially @actions/core and @actions/github) but if so please specify why you think it's needed, and try to reduce the file-clutter to a minimum.
