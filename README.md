# ASM Runner

A VS Code extension for writing and running 16-bit DOS assembly programs (TASM) directly in the editor.

## Features

- **One-click build & run** — click the ▶ button in the editor toolbar to assemble, link and run your `.asm` file
- **Interactive terminal** — full stdin/stdout support via MS-DOS Player, right inside VS Code
- **Silent build** — DOSBox runs hidden in the background, no popups or focus stealing
- **Build output** — errors from TASM/TLINK appear in a dedicated terminal panel
- **Clean workspace** — all build artifacts go into a `_build` folder next to your `.asm` file

## Requirements

No additional software required.

## Usage

1. Open any `.asm` file
2. Click the **▶** button in the top right corner of the editor
3. Your program will be assembled, linked and launched in an interactive terminal

## Output
```
────────────────────────────────────────
             RUN  hello.exe
────────────────────────────────────────

Hello, World!

────────────────────────────────────────
                 DONE
────────────────────────────────────────
```

## Build Errors

If your code has errors, a terminal will open showing the full TASM output with error details.

## Example Program
```asm
STACK_SEG SEGMENT STACK
    db 256 dup(0)
STACK_SEG ENDS

DATA_SEG SEGMENT
    msg db 'Hello, World!$'
DATA_SEG ENDS

CODE_SEG SEGMENT
ASSUME CS:CODE_SEG, DS:DATA_SEG, SS:STACK_SEG

START:
    mov ax, DATA_SEG
    mov ds, ax
    mov ah, 09h
    lea dx, msg
    int 21h
    mov ah, 4Ch
    int 21h

CODE_SEG ENDS
END START
```

## Bundled Tools

This extension includes the following tools so you don't need to install anything:

- **DOSBox-X** by the DOSBox-X team — [dosbox-x.com](https://dosbox-x.com)  
  Licensed under GNU GPL v2

- **Turbo Assembler (TASM 4.1) & Turbo Linker (TLINK 7.1)** by Borland International  
  Distributed as abandonware

- **MS-DOS Player** by Takeda Toshiya — [github.com/takeda-toshiya/msdos](https://github.com/takeda-toshiya/msdos)  
  Licensed under MIT

## Notes

- Only `.asm` files are supported
- Designed for 16-bit DOS programs using INT 21h
- Tested on Windows 11

## Acknowledgements

- DOSBox-X team for the DOS emulator
- Takeda Toshiya for MS-DOS Player
- Borland International for Turbo Assembler