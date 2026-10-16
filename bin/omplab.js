#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const PROGRAMS_DIR = path.join(__dirname, '..', 'programs');

// Short description and compile/run hint for each program.
const CATALOG = {
  prg1: { title: 'OpenMP: sequential vs parallel merge sort', kind: 'omp' },
  prg2: { title: 'OpenMP: static schedule(static,2) iteration split per thread', kind: 'omp', interactive: true },
  prg3: { title: 'OpenMP: Fibonacci with tasks', kind: 'omp', interactive: true },
  prg4: { title: 'OpenMP: primes from 1..n, serial vs parallel timing', kind: 'omp', interactive: true, libm: true },
  prg5: { title: 'MPI: point-to-point Send/Recv between rank 0 and 1', kind: 'mpi', np: 2 },
  prg6: { title: 'MPI: deadlock (DEADLOCK_PART 1) and avoidance (DEADLOCK_PART 2)', kind: 'mpi', np: 2 },
  prg7: { title: 'MPI: Bcast from rank 0', kind: 'mpi', np: 4 },
  prg8: { title: 'MPI: Scatter + Gather', kind: 'mpi', np: 4 },
  prg9: { title: 'MPI: Reduce and Allreduce (sum/prod/max/min)', kind: 'mpi', np: 4 },
};

function buildHint(name) {
  const p = CATALOG[name];
  if (p.kind === 'omp') {
    return `gcc -fopenmp ${name}.c -o ${name}${p.libm ? ' -lm' : ''} && ./${name}`;
  }
  return `mpicc ${name}.c -o ${name} && mpirun -np ${p.np} ./${name}`;
}

function normalize(arg) {
  const name = String(arg).toLowerCase().replace(/\.c$/, '');
  if (CATALOG[name]) return name;
  if (/^\d+$/.test(name) && CATALOG['prg' + name]) return 'prg' + name;
  return null;
}

function resolveNames(args) {
  if (args.length === 0) die('Specify which program(s), e.g. "omplab get prg1" or "omplab get all".');
  if (args.some((a) => a.toLowerCase() === 'all')) return Object.keys(CATALOG);
  return args.map((a) => normalize(a) || die(`Unknown program "${a}". Run "omplab list" to see what exists.`));
}

function die(msg) {
  console.error(`omplab: ${msg}`);
  process.exit(1);
}

function list() {
  console.log('Available programs:\n');
  for (const [name, p] of Object.entries(CATALOG)) {
    console.log(`  ${name.padEnd(5)} [${p.kind.toUpperCase().padEnd(3)}]  ${p.title}`);
  }
  console.log('\nUse "omplab show <name>" to view code, "omplab get <name>" to save it.');
}

function show(args) {
  for (const name of resolveNames(args)) {
    const src = fs.readFileSync(path.join(PROGRAMS_DIR, `${name}.c`), 'utf8');
    console.log(`// ===== ${name}.c — ${CATALOG[name].title} =====`);
    console.log(`// Build & run: ${buildHint(name)}\n`);
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
    console.log(`         build: ${buildHint(name)}`);
  }
}

function help() {
  console.log(`omplab — OpenMP / MPI lab programs

Usage:
  omplab list                      List all programs
  omplab show <name...|all>        Print program source to the terminal
  omplab get  <name...|all>        Save program(s) as .c files in the current directory
        -d, --dir <path>           Save into <path> instead
        -f, --force                Overwrite existing files

Names can be written as prg1, prg1.c or just 1.

Examples:
  npx omplab list
  npx omplab show 3
  npx omplab get prg1 prg5
  npx omplab get all -d lab`);
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
    // Allow "omplab prg3" as a shortcut for "omplab show prg3".
    if (normalize(cmd)) show([cmd, ...args]);
    else die(`Unknown command "${cmd}". Run "omplab help".`);
}
