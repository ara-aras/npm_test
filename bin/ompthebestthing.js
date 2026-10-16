#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PROGRAMS_DIR = path.join(__dirname, '..', 'programs');

// Short description plus the exact compile and run commands for each program.
const CATALOG = {
  prg1: {
    title: 'OpenMP: sequential vs parallel merge sort',
    compile: 'gcc -fopenmp prg1.c -o prg1',
    run: 'export OMP_NUM_THREADS=4 && ./prg1',
  },
  prg2: {
    title: 'OpenMP: static schedule(static,2) iteration split per thread',
    compile: 'gcc -fopenmp prg2.c -o prg2',
    run: 'export OMP_NUM_THREADS=4 && ./prg2',
  },
  prg3: {
    title: 'OpenMP: Fibonacci with tasks',
    compile: 'gcc -fopenmp prg3.c -o prg3',
    run: 'export OMP_NUM_THREADS=4 && ./prg3',
  },
  prg4: {
    title: 'OpenMP: primes from 1..n, serial vs parallel timing',
    compile: 'gcc -fopenmp prg4.c -o prg4 -lm',
    run: 'export OMP_NUM_THREADS=4 && ./prg4',
  },
  prg5: {
    title: 'MPI: point-to-point Send/Recv between rank 0 and 1',
    compile: 'mpicc prg5.c -o prg5',
    run: 'mpirun -np 2 ./prg5',
  },
  prg6: {
    title: 'MPI: deadlock (DEADLOCK_PART 1) and avoidance (DEADLOCK_PART 2)',
    compile: 'mpicc prg6.c -o prg6',
    run: 'mpirun -np 2 ./prg6',
  },
  prg7: {
    title: 'MPI: Bcast from rank 0',
    compile: 'mpicc prg7.c -o prg7',
    run: 'mpirun -np 4 ./prg7',
  },
  prg8: {
    title: 'MPI: Scatter + Gather',
    compile: 'mpicc prg8.c -o prg8',
    run: 'mpirun -np 4 ./prg8',
  },
  prg9: {
    title: 'MPI: Reduce and Allreduce (sum/prod/max/min)',
    compile: 'mpicc prg9.c -o prg9',
    run: 'mpirun -np 4 ./prg9',
  },
};

function normalize(arg) {
  const name = String(arg).toLowerCase().replace(/\.c$/, '');
  if (CATALOG[name]) return name;
  if (/^\d+$/.test(name) && CATALOG['prg' + name]) return 'prg' + name;
  return null;
}

function resolveNames(args) {
  if (args.length === 0) die('Specify which program(s), e.g. "ompthebestthing get prg1" or "ompthebestthing get all".');
  if (args.some((a) => a.toLowerCase() === 'all')) return Object.keys(CATALOG);
  return args.map((a) => normalize(a) || die(`Unknown program "${a}". Run "ompthebestthing list" to see what exists.`));
}

function die(msg) {
  console.error(`ompthebestthing: ${msg}`);
  process.exit(1);
}

function list() {
  console.log('Available programs:\n');
  for (const [name, p] of Object.entries(CATALOG)) {
    console.log(`  ${name.padEnd(5)} ${p.title}`);
  }
  console.log('\nUse "ompthebestthing show <name>" to view code, "ompthebestthing get <name>" to save it.');
}

function show(args) {
  for (const name of resolveNames(args)) {
    const src = fs.readFileSync(path.join(PROGRAMS_DIR, `${name}.c`), 'utf8');
    console.log(`// ===== ${name}.c — ${CATALOG[name].title} =====`);
    console.log(`// Compile: ${CATALOG[name].compile}`);
    console.log(`// Run:     ${CATALOG[name].run}\n`);
    process.stdout.write(src);
    console.log('');
  }
}

function get(args) {
  let dir = process.cwd();
  let force = false;
  const rest = [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '-f' || a === '--force') force = true;
    else if (a === '-d' || a === '--dir') {
      if (!args[i + 1]) die(`${a} needs a directory.`);
      dir = path.resolve(args[++i]);
    } else rest.push(a);
  }

  fs.mkdirSync(dir, { recursive: true });
  for (const name of resolveNames(rest)) {
    const dest = path.join(dir, `${name}.c`);
    if (fs.existsSync(dest) && !force) {
      console.log(`  skip   ${dest} (already exists, use --force to overwrite)`);
      continue;
    }
    fs.copyFileSync(path.join(PROGRAMS_DIR, `${name}.c`), dest);
    console.log(`  saved  ${dest}`);
    console.log(`         compile: ${CATALOG[name].compile}`);
    console.log(`         run:     ${CATALOG[name].run}`);
  }
}

function help() {
  console.log(`ompthebestthing — OpenMP / MPI lab programs

Usage:
  ompthebestthing list               List all programs
  ompthebestthing show <name...|all> Print program source to the terminal
  ompthebestthing get  <name...|all> Save program(s) as .c files in the current directory
        -d, --dir <path>    Save into <path> instead
        -f, --force         Overwrite existing files

Names can be written as prg1, prg1.c or just 1.

Examples:
  npx ompthebestthing list
  npx ompthebestthing show 3
  npx ompthebestthing get prg1 prg5
  npx ompthebestthing get all -d lab`);
}

const [cmd, ...args] = process.argv.slice(2);
switch (cmd) {
  case undefined:
  case 'list':
  case 'ls':
    list();
    break;
  case 'show':
  case 'cat':
    show(args);
    break;
  case 'get':
  case 'install':
  case 'i':
    get(args);
    break;
  case 'help':
  case '-h':
  case '--help':
    help();
    break;
  default:
    // Allow "ompthebestthing prg3" as a shortcut for "ompthebestthing show prg3".
    if (normalize(cmd)) show([cmd, ...args]);
    else die(`Unknown command "${cmd}". Run "ompthebestthing help".`);
}
